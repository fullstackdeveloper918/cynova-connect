import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OpenAI } from "https://deno.land/x/openai@v4.24.0/mod.ts";

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
    const { script } = await req.json();
    console.log('Received script:', script);

    if (!script) {
      throw new Error('No script provided');
    }

    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const openai = new OpenAI({ apiKey: openAiKey });

    // Split script into sections for frame generation
    const sections = script.split(/[.!?]+/).filter(Boolean).map(s => s.trim());
    const framePrompts = sections.slice(0, 4).map(section => 
      `Create a high quality, cinematic video frame for this scene: ${section}. Make it photorealistic and visually striking.`
    );

    console.log('Generating frames with DALL-E...');
    console.log('Frame prompts:', framePrompts);
    
    const frameUrls = await Promise.all(
      framePrompts.map(async (prompt) => {
        try {
          const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024",
            quality: "standard",
            style: "natural"
          });
          console.log('Generated frame URL:', response.data[0].url);
          return response.data[0].url;
        } catch (error) {
          console.error('Error generating frame:', error);
          throw error;
        }
      })
    );

    console.log('Generated frame URLs:', frameUrls);

    return new Response(
      JSON.stringify({ 
        frameUrls,
        message: "Frames generated successfully" 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error in generate-video-frames function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate video frames',
        details: error.message
      }),
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