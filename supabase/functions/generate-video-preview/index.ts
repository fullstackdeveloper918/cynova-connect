import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

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

    const audioBuffer = await audioResponse.arrayBuffer();
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;
    console.log('Audio generated successfully');

    // Generate video with Replicate
    console.log('Generating video with Replicate...');
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
          width: 768,
          height: 432,
          num_frames: parseInt(duration) || 24,
          fps: 8,
        },
      }),
    });

    if (!videoResponse.ok) {
      const errorText = await videoResponse.text();
      console.error('Replicate API Error:', errorText);
      throw new Error(`Replicate API error: ${errorText}`);
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