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
            content: `Generate exactly ${questionCount} "Would You Rather" questions. Each question should have two options. Return ONLY a JSON array of objects with 'optionA' and 'optionB' properties. No additional text or formatting.`
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
    
    if (!data.choices?.[0]?.message?.content) {
      console.error('Unexpected OpenAI response structure:', data);
      throw new Error('Invalid response from OpenAI');
    }

    const content = data.choices[0].message.content;
    console.log('Raw OpenAI response:', content);

    try {
      // Remove any potential markdown or extra formatting
      const cleanContent = content.replace(/```json\n|\n```|```/g, '').trim();
      console.log('Cleaned content:', cleanContent);
      
      const questions = JSON.parse(cleanContent);
      
      if (!Array.isArray(questions)) {
        console.error('Response is not an array:', questions);
        throw new Error('Response is not an array');
      }

      // Validate question format
      questions.forEach((q, index) => {
        if (!q.optionA || !q.optionB) {
          console.error(`Invalid question format at index ${index}:`, q);
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