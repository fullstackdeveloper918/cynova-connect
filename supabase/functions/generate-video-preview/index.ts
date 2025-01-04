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
            content: 'You are a video description generator. Create concise, visual descriptions that can be used to generate engaging videos. Focus on describing visual elements, movements, and scenes. Keep it under 75 words.'
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

    // Use Replicate's API for video generation
    const replicateApiKey = Deno.env.get('REPLICATE_API_KEY');
    if (!replicateApiKey) {
      throw new Error('REPLICATE_API_KEY is not set');
    }

    console.log('Starting video generation with Replicate...');
    
    // Using the Zeroscope model with a specific version
    const modelOwner = "anotherjesse";
    const modelName = "zeroscope-v2-xl";
    const modelVersion = "71996d331e8ede8ef7bd76eba9fae076d31792e4ddf4ad057779b443d6aea62f";
    
    console.log(`Using Replicate model: ${modelOwner}/${modelName}@${modelVersion}`);
    
    const replicateResponse = await fetch(`https://api.replicate.com/v1/predictions`, {
      method: "POST",
      headers: {
        "Authorization": `Token ${replicateApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: modelVersion,
        input: {
          prompt: videoDescription,
          video_length: "14_frames_with_svd",
          fps: 8,
          width: 576,
          height: 320,
          guidance_scale: 17.5,
          num_inference_steps: 50,
          negative_prompt: "blurry, low quality, low resolution, bad quality, ugly, duplicate frames"
        },
      }),
    });

    if (!replicateResponse.ok) {
      const error = await replicateResponse.json();
      console.error('Replicate API Error:', error);
      
      if (error.detail?.includes('Invalid token')) {
        throw new Error('Invalid Replicate API token. Please check your API key.');
      } else if (error.detail?.includes('Permission denied')) {
        throw new Error('Permission denied by Replicate. Please verify your API key has the correct permissions.');
      } else if (error.status === 402) {
        throw new Error('Replicate API quota exceeded or payment required.');
      }
      
      throw new Error(`Replicate API error: ${JSON.stringify(error)}`);
    }

    const prediction = await replicateResponse.json();
    console.log('Prediction created:', prediction);

    // Poll for completion
    const maxAttempts = 60;
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
        const error = await pollResponse.json();
        console.error('Poll response error:', error);
        throw new Error(`Failed to poll prediction: ${JSON.stringify(error)}`);
      }

      const result = await pollResponse.json();
      console.log('Poll result status:', result.status);

      if (result.status === "succeeded") {
        console.log('Video generation succeeded:', result);
        return new Response(
          JSON.stringify({ 
            previewUrl: result.output,
            message: "Preview generated successfully" 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else if (result.status === "failed") {
        console.error('Video generation failed:', result.error);
        throw new Error(`Video generation failed: ${result.error}`);
      } else if (result.status === "canceled") {
        throw new Error('Video generation was canceled');
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});