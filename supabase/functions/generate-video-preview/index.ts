import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { generateAudio } from "./audioService.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
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
    
    // Generate video with Replicate
    const replicateResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${replicateApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "85d775927d738f501d2b7fcc5f33d8566904f27d7b29960f1a8c0195220d1c7d",
        input: {
          prompt: script,
          num_frames: 50,
          fps: 24,
          width: 576,
          height: 320,
          guidance_scale: 12.5,
          num_inference_steps: 50,
          negative_prompt: "blurry, low quality, low resolution, bad quality, ugly, duplicate frames"
        },
      }),
    });

    if (!replicateResponse.ok) {
      const error = await replicateResponse.text();
      console.error('Replicate API Error:', error);
      throw new Error(`Replicate API error: ${error}`);
    }

    const prediction = await replicateResponse.json();
    console.log('Video generation started:', prediction);

    // Poll for the video result
    const pollInterval = 1000;
    const maxAttempts = 60;
    let attempts = 0;
    let videoUrl = null;

    while (attempts < maxAttempts && !videoUrl) {
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