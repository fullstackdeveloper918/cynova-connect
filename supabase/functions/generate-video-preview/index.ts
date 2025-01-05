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
    console.log('Received request with script:', script);

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
    
    // Use Zeroscope XL for video generation with improved parameters
    const videoResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${replicateApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "85d775927d738f501d2b7fcc5f33d8566904f27d7b29960f1a8c0195220d1c7d",
        input: {
          prompt: script,
          negative_prompt: "blurry, low quality, low resolution, bad quality, ugly, duplicate frames",
          width: 768,
          height: 432,
          num_frames: 24,
          num_inference_steps: 50,
          fps: 8,
          guidance_scale: 17.5,
        },
      }),
    });

    if (!videoResponse.ok) {
      const errorText = await videoResponse.text();
      console.error('Replicate API Error:', errorText);
      throw new Error(`Replicate API error: ${errorText}`);
    }

    const predictionData = await videoResponse.json();
    console.log('Video generation started:', predictionData);

    // Poll for completion with improved error handling
    let attempts = 0;
    const maxAttempts = 60;
    const pollInterval = 2000; // 2 seconds
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
        const errorText = await pollResponse.text();
        console.error('Poll response error:', errorText);
        throw new Error(`Failed to poll prediction: ${errorText}`);
      }

      const result = await pollResponse.json();
      console.log('Poll result status:', result.status);

      if (result.status === "succeeded") {
        videoUrl = result.output;
        console.log('Video generation succeeded:', videoUrl);
        break;
      } else if (result.status === "failed") {
        console.error('Video generation failed:', result.error);
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
    
    if (!audioResponse.ok) {
      const errorText = await audioResponse.text();
      console.error('Audio generation error:', errorText);
      throw new Error(`Audio generation failed: ${errorText}`);
    }
    
    const audioBlob = await audioResponse.blob();
    const audioBase64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(audioBlob);
    });

    console.log('Successfully generated both video and audio');

    return new Response(
      JSON.stringify({
        previewUrl: {
          videoUrl,
          audioUrl: audioBase64,
        }
      }),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );

  } catch (error) {
    console.error('Error in generate-video-preview:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});