import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { script } = await req.json();
    console.log('Received request:', { script });

    if (!script) {
      throw new Error('No script provided');
    }

    const replicateApiKey = Deno.env.get('REPLICATE_API_KEY');
    if (!replicateApiKey) {
      console.error('REPLICATE_API_KEY is not set');
      throw new Error('REPLICATE_API_KEY is not set');
    }

    console.log('Generating video with Replicate...');
    
    // Use Replicate's text-to-video model
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${replicateApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "7f41f689247f1e671d3f5f2d2dd0978b6532af61b2c109dd5f5ad3be3a76e01d",
        input: {
          prompt: script,
          num_frames: 50,
          width: 1024,
          height: 576,
          num_inference_steps: 50,
          fps: 15,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Replicate API Error:', error);
      throw new Error(`Replicate API error: ${error.detail || JSON.stringify(error)}`);
    }

    const prediction = await response.json();
    console.log('Prediction created:', prediction);

    // Poll for the result
    const pollInterval = 1000; // 1 second
    const maxAttempts = 300; // 5 minutes max
    let attempts = 0;
    let result;

    while (attempts < maxAttempts) {
      const pollResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            "Authorization": `Token ${replicateApiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      result = await pollResponse.json();
      if (result.status === "succeeded") {
        break;
      } else if (result.status === "failed") {
        throw new Error(`Video generation failed: ${result.error}`);
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
      attempts++;
    }

    if (!result?.output) {
      throw new Error('Video generation timed out or failed');
    }

    return new Response(
      JSON.stringify({ 
        previewUrl: result.output,
        message: "Preview generated successfully" 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error in generate-video-preview function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate video preview',
        details: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});