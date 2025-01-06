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
    const { topic } = await req.json();

    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    console.log('Generating quiz questions for topic:', topic);

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
            content: 'You are a quiz question generator. Generate 5 engaging quiz questions about the given topic. Return an array of question objects in the exact format specified, with no additional text or formatting. Each question should be either multiple choice (4 options) or true/false.'
          },
          {
            role: 'user',
            content: `Generate quiz questions about: ${topic}. Return them in this exact format:
            [
              {
                "question": "string",
                "type": "multiple_choice",
                "options": ["string", "string", "string", "string"],
                "correctAnswer": "string"
              }
            ]`
          }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    console.log('OpenAI response:', data);

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    let questions;
    try {
      questions = JSON.parse(data.choices[0].message.content.trim());
      console.log('Parsed questions:', questions);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      throw new Error('Failed to parse questions from OpenAI response');
    }

    return new Response(
      JSON.stringify({ questions }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error in generate-quiz-questions:', error);
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