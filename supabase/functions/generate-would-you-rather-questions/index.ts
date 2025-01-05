import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { count = 1 } = await req.json();
    const questionCount = Math.min(Math.max(1, count), 10); // Ensure count is between 1 and 10

    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a creative assistant that generates engaging "Would You Rather" questions. Generate ${questionCount} pairs of interesting, thought-provoking options that will spark discussion. Format your response as a JSON array of objects with optionA and optionB properties.`
          },
          {
            role: 'user',
            content: `Generate ${questionCount} would you rather questions.`
          }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const questions = JSON.parse(content);
      
      if (!Array.isArray(questions)) {
        throw new Error('Response is not an array');
      }
      
      // Validate question format
      questions.forEach((q, index) => {
        if (!q.optionA || !q.optionB) {
          console.error('Invalid question format:', q);
          throw new Error(`Question ${index + 1} is missing required options`);
        }
      });

      return new Response(
        JSON.stringify({ questions }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      console.error('Raw content:', content);
      throw new Error(`Invalid response format: ${parseError.message}`);
    }

  } catch (error) {
    console.error('Error in generate-would-you-rather-questions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});