import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Function to chunk array buffer conversion
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const chunk_size = 8192; // Process 8KB at a time
  const uint8Array = new Uint8Array(buffer);
  let binary = '';
  
  for (let i = 0; i < uint8Array.length; i += chunk_size) {
    const chunk = uint8Array.slice(i, i + chunk_size);
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }
  
  return btoa(binary);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting generate-video-preview function...');
    const { script, voice, duration } = await req.json();
    console.log('Request parameters:', { script, voice, duration });

    // Get API keys and verify they exist
    const replicateApiKey = Deno.env.get('REPLICATE_API_KEY');
    const elevenLabsKey = Deno.env.get('ELEVEN_LABS_API_KEY');

    if (!replicateApiKey || !elevenLabsKey) {
      throw new Error('Missing required API keys');
    }

    // Generate audio with ElevenLabs
    console.log('Generating audio with ElevenLabs...');
    const audioResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsKey,
        },
        body: JSON.stringify({
          text: script,
          model_id: "eleven_turbo_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    );

    if (!audioResponse.ok) {
      const errorText = await audioResponse.text();
      console.error('ElevenLabs API Error:', errorText);
      throw new Error(`ElevenLabs API error: ${errorText}`);
    }

    // Process audio data in chunks
    console.log('Processing audio data...');
    const audioBuffer = await audioResponse.arrayBuffer();
    const audioBase64 = arrayBufferToBase64(audioBuffer);
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;
    console.log('Audio processed successfully');

    // Generate video with Replicate
    // Using Stable Video Diffusion model for video generation
    console.log('Generating video with Replicate...');
    const videoResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${replicateApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "061e0772e3c5887e755a2b8d885d9dab44e55dcc28830be4e0f98e5d2c1d4c2a",
        input: {
          prompt: script,
          num_frames: 24,
          width: 1024,
          height: 576,
          fps: 8,
          num_inference_steps: 25,
          motion_bucket_id: 127,
          guidance_scale: 12.5
        },
      }),
    });

    if (!videoResponse.ok) {
      const errorData = await videoResponse.json();
      console.error('Replicate API Error:', errorData);
      throw new Error(`Replicate API error: ${JSON.stringify(errorData)}`);
    }

    const predictionData = await videoResponse.json();
    console.log('Video generation started. Prediction ID:', predictionData.id);

    // Poll for video completion
    let videoUrl = null;
    let attempts = 0;
    const maxAttempts = 30;

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
        throw new Error(`Failed to check prediction status: ${await pollResponse.text()}`);
      }

      const prediction = await pollResponse.json();
      console.log('Prediction status:', prediction.status);

      if (prediction.status === 'succeeded') {
        videoUrl = prediction.output;
        break;
      } else if (prediction.status === 'failed') {
        throw new Error('Video generation failed');
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    if (!videoUrl) {
      throw new Error('Video generation timed out');
    }

    console.log('Video generated successfully:', videoUrl);

    // Return success response with both URLs
    return new Response(
      JSON.stringify({
        success: true,
        previewUrl: {
          videoUrl,
          audioUrl
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