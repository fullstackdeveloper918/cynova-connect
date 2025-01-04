import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      }
    });
  }

  try {
    console.log('Received request method:', req.method);
    
    const { script, voice } = await req.json();
    console.log('Received request payload:', { script, voice });

    if (!script) {
      throw new Error('No script provided');
    }

    const replicateApiKey = Deno.env.get('REPLICATE_API_KEY');
    if (!replicateApiKey) {
      console.error('REPLICATE_API_KEY is not set');
      throw new Error('REPLICATE_API_KEY is not set');
    }

    console.log('Starting video generation with Replicate...');
    
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${replicateApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438",
        input: {
          prompt: script,
          video_length: "14_frames_with_svd",
          fps: 6,
          width: 1024,
          height: 576,
          num_inference_steps: 25,
          guidance_scale: 12.5,
          negative_prompt: "bad quality, worse quality, low quality, blurry, low resolution",
          input_image: "https://raw.githubusercontent.com/CompVis/stable-diffusion/main/assets/stable-samples/img2img/sketch-mountains-input.jpg"
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

    // Poll for the result with timeout handling
    const pollInterval = 1000; // 1 second
    const maxAttempts = 300; // 5 minutes max
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
        const videoUrl = Array.isArray(result.output) ? result.output[0] : result.output;
        console.log('Generated video URL:', videoUrl);
        
        if (!videoUrl) {
          throw new Error('No video URL in the output');
        }

        return new Response(
          JSON.stringify({ 
            previewUrl: videoUrl,
            message: "Preview generated successfully" 
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
    console.error('Error in generate-video-preview function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate video preview',
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