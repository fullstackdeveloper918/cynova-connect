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
    
    // Create prediction using Zeroscope V2 model
    const prediction = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${replicateApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "b72a11fe6c2a1c97a946ad4deb260c3951f4c72c89f8f5808a58c5969d2f1c11",
        input: {
          prompt: script,
          video_length: "14_frames_with_svd",
          fps: 24,
          width: 576,
          height: 320,
          num_inference_steps: 30,
          guidance_scale: 12.5,
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