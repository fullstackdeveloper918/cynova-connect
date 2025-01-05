import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OpenAI } from "https://esm.sh/openai@4.28.0";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { script } = await req.json();
    
    if (!script) {
      throw new Error('Script is required');
    }

    console.log('Generating frames for script:', script);

    // Initialize OpenAI
    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const openai = new OpenAI({ apiKey: openAiKey });

    // Split script into meaningful sections for frame generation
    const sections = script.split(/[.!?]+/).filter(Boolean).map(s => s.trim());
    console.log('Split script into sections:', sections);

    const framePrompts = sections.map(section => 
      `Create a vertical video frame (9:16 aspect ratio) for this scene: "${section}". Style: cinematic, high quality, photorealistic. Make it suitable for TikTok/YouTube Shorts with vibrant colors and engaging composition.`
    );

    console.log('Generated prompts:', framePrompts);
    
    const frameUrls = await Promise.all(
      framePrompts.map(async (prompt, index) => {
        try {
          console.log(`Starting generation for frame ${index + 1} with prompt:`, prompt);
          const response = await openai.images.generate({
            model: "dall-e-3",
            prompt,
            n: 1,
            size: "1024x1792",
            quality: "standard",
            style: "natural"
          });
          
          console.log(`Frame ${index + 1} generated successfully:`, response.data[0].url);
          return response.data[0].url;
        } catch (error) {
          console.error(`Error generating frame ${index + 1}:`, error);
          throw error;
        }
      })
    );

    console.log('All frames generated successfully. Total frames:', frameUrls.length);

    return new Response(
      JSON.stringify({
        success: true,
        frameUrls
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error in generate-video-frames:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message 
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