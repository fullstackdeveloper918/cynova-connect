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
    console.log('Starting video generation process...');
    
    const { script, voice, duration = "48" } = await req.json();
    console.log('Received request payload:', { script, voice, duration });

    if (!script) {
      throw new Error('No script provided');
    }

    // First, generate video description with OpenAI
    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    console.log('Generating video description with OpenAI...');
    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a video description generator. Create detailed, visual descriptions that can be used to generate engaging videos. Focus on describing visual elements, movements, and scenes.'
          },
          {
            role: 'user',
            content: `Create a detailed visual description for a video based on this script: ${script}`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!openAiResponse.ok) {
      const error = await openAiResponse.json();
      console.error('OpenAI API Error:', error);
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const openAiData = await openAiResponse.json();
    const videoDescription = openAiData.choices[0].message.content;
    console.log('Generated video description:', videoDescription);

    // Then, use Replicate to generate the video
    const replicateApiKey = Deno.env.get('REPLICATE_API_KEY');
    if (!replicateApiKey) {
      throw new Error('REPLICATE_API_KEY is not set');
    }

    console.log('Starting video generation with Replicate...');
    const replicateResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${replicateApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "2b017d9b67edd2ee1401238df49d75da53c523f36e363881e057f5dc3ed3c5b2",
        input: {
          prompt: videoDescription,
          num_frames: 24,
          width: 576,
          height: 320,
          fps: 8,
          num_inference_steps: 25,
          guidance_scale: 12.5
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