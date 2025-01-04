import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1";

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

    const configuration = new Configuration({
      apiKey: openAiKey,
    });

    const openai = new OpenAIApi(configuration);

    console.log('Calling OpenAI API to generate script...');
    
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a professional video script writer. Create engaging, ${style} scripts that are concise and visually descriptive.`
        },
        {
          role: "user",
          content: `Write a short video script about: ${prompt}. Keep it under 60 seconds when read aloud. Focus on visual descriptions that can be animated.`
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    if (!completion.data.choices[0].message?.content) {
      throw new Error('No script generated');
    }

    const script = completion.data.choices[0].message.content;
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