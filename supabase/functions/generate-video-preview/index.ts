import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { generateAudio } from "./audioService.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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
    
    // Create prediction using Stable Video Diffusion model
    const prediction = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${replicateApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "2b017d9b67edd2ee1401238df49d75da53c523f36e363881e057f5dc3ed3c5b2",
        input: {
          html: `<div style="background-color: #000; color: #fff; font-family: Arial; padding: 20px; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; text-align: center;">
            <p style="font-size: 24px;">${script}</p>
          </div>`,
          width: 1080,
          height: 1920,
          fps: 30,
          duration: 10,
          quality: "high",
          format: "mp4",
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