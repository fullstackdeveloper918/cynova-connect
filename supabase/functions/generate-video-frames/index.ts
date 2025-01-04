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

    // Generate a sequence of 4 frames based on the script
    const framePrompts = [
      `Frame 1: ${script.substring(0, 200)}`,
      `Frame 2: ${script.substring(200, 400)}`,
      `Frame 3: ${script.substring(400, 600)}`,
      `Frame 4: ${script.substring(600, 800)}`
    ].filter(prompt => prompt.length > 10);

    console.log('Generating frames with DALL-E...');
    
    const frameUrls = await Promise.all(
      framePrompts.map(async (prompt) => {
        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: prompt + " Make it look like a video frame, cinematic quality.",
          n: 1,
          size: "1024x1024",
          quality: "standard",
          style: "natural"
        });
        return response.data[0].url;
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