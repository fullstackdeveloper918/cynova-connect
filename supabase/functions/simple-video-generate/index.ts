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
    const { prompt } = await req.json();
    console.log('Received prompt:', prompt);

    if (!prompt) {
      throw new Error('No prompt provided');
    }

    // Get API key
    const replicateApiKey = Deno.env.get('REPLICATE_API_KEY');
    if (!replicateApiKey) {
      throw new Error('REPLICATE_API_KEY is not set');
    }

    console.log('Starting video generation with Replicate...');
    
    // Use Zeroscope XL for video generation
    const replicateResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${replicateApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "cd76ef3c79c568f25d0eb36e3faa44df6433f5b7e2b3d4e2d55f6e3d5b5f51c4",
        input: {
          prompt,
          num_frames: 24,
          fps: 8,
          width: 768,
          height: 432,
          guidance_scale: 12.5,
          num_inference_steps: 50,
          negative_prompt: "blurry, low quality, low resolution, bad quality"
        },
      }),
    });

    if (!replicateResponse.ok) {
      const error = await replicateResponse.json();
      console.error('Replicate API Error:', error);
      throw new Error(`Replicate API error: ${error.detail || JSON.stringify(error)}`);
    }

    const prediction = await replicateResponse.json();
    console.log('Prediction created:', prediction);

    // Poll for the result
    const pollInterval = 1000;
    const maxAttempts = 300;
    let attempts = 0;

    while (attempts < maxAttempts) {
      console.log(`Polling attempt ${attempts + 1}/${maxAttempts}`);
      
      const pollResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            "Authorization": `Token ${replicateApiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!pollResponse.ok) {
        console.error('Poll response error:', pollResponse.status, pollResponse.statusText);
        throw new Error(`Failed to poll prediction: ${pollResponse.statusText}`);
      }

      const result = await pollResponse.json();
      console.log('Poll result status:', result.status);

      if (result.status === "succeeded") {
        const videoUrl = result.output;
        console.log('Generated video URL:', videoUrl);
        
        return new Response(
          JSON.stringify({ 
            videoUrl,
            message: "Video generated successfully" 
          }),
          { 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          }
        );
      } else if (result.status === "failed") {
        console.error('Video generation failed:', result.error);
        throw new Error(`Video generation failed: ${result.error}`);
      } else if (result.status === "canceled") {
        console.error('Video generation was canceled');
        throw new Error('Video generation was canceled');
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
      attempts++;
    }

    throw new Error('Video generation timed out');

  } catch (error) {
    console.error('Error in simple-video-generate function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate video',
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