import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, style = "engaging and professional" } = await req.json();
    console.log('Received prompt:', prompt);
    console.log('Style:', style);

    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    console.log('Calling OpenAI API to generate script...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // Changed from gpt-4 to use fewer credits
        messages: [
          {
            role: 'system',
            content: `You are a video script writer. Create short test scripts for video generation testing.`
          },
          {
            role: 'user',
            content: `Write a very short test script (2-3 sentences) about: ${prompt}. Keep it under 15 seconds when read aloud.`
          }
        ],
        temperature: 0.7,
        max_tokens: 100, // Reduced from 500 to use fewer tokens
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API Error:', error);
      throw new Error(error.error?.message || 'Failed to generate script');
    }

    const data = await response.json();
    console.log('OpenAI API Response:', data);

    const script = data.choices[0].message.content;
    console.log('Generated script:', script);

    return new Response(
      JSON.stringify({ 
        script,
        message: "Script generated successfully" 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in generate-video-content function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate video content',
        details: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});