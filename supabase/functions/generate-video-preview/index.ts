import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { generateAudio } from "./audioService.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { script, voice } = await req.json();

    if (!script) {
      throw new Error('No script provided');
    }

    // Get API keys from environment
    const replicateApiKey = Deno.env.get('REPLICATE_API_KEY');
    const elevenLabsKey = Deno.env.get('ELEVEN_LABS_API_KEY');

    if (!replicateApiKey || !elevenLabsKey) {
      throw new Error('Missing required API keys');
    }

    console.log('Starting video generation with Replicate...');
    
    // Create prediction with proper authentication and correct model
    const prediction = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${replicateApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Using the Zeroscope XL model which is specifically for text-to-video generation
        version: "b72a26c92b9cc526809439de7296c910a8f62aa6ebdc95f9a99b9c4d4f8ecd56",
        input: {
          prompt: script,
          video_length: "14_frames_with_svd",  // Shorter for testing
          fps: 8,
          width: 576,
          height: 320,
          guidance_scale: 12.5,
          num_inference_steps: 30, // Reduced for testing
          negative_prompt: "blurry, low quality, low resolution, bad quality, ugly, duplicate frames"
        },
      }),
    });

    if (!prediction.ok) {
      const error = await prediction.text();
      console.error('Replicate API Error:', error);
      throw new Error(`Replicate API error: ${error}`);
    }

    const predictionData = await prediction.json();
    console.log('Video generation started:', predictionData);

    // Poll for completion
    let attempts = 0;
    const maxAttempts = 60;
    const pollInterval = 1000;
    let videoUrl = null;

    while (attempts < maxAttempts && !videoUrl) {
      console.log(`Polling attempt ${attempts + 1}/${maxAttempts}`);
      
      const pollResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${predictionData.id}`,
        {
          headers: {
            "Authorization": `Token ${replicateApiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!pollResponse.ok) {
        throw new Error(`Failed to poll prediction: ${pollResponse.statusText}`);
      }

      const result = await pollResponse.json();
      console.log('Poll result status:', result.status);

      if (result.status === "succeeded") {
        videoUrl = result.output;
        break;
      } else if (result.status === "failed") {
        throw new Error(`Video generation failed: ${result.error}`);
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
      attempts++;
    }

    if (!videoUrl) {
      throw new Error('Video generation timed out');
    }

    // Generate audio narration with ElevenLabs
    console.log('Generating audio narration...');
    const audioResponse = await generateAudio(script, voice, elevenLabsKey);
    const audioBlob = await audioResponse.blob();
    const audioBase64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(audioBlob);
    });

    return new Response(
      JSON.stringify({
        previewUrl: {
          videoUrl,
          audioUrl: audioBase64,
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error in generate-video-preview:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});