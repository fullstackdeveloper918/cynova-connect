import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { generateAudio } from "./audioService.ts";

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

    console.log('Checking API keys...');
    console.log('Replicate API Key exists:', !!replicateApiKey);
    console.log('ElevenLabs API Key exists:', !!elevenLabsKey);

    if (!replicateApiKey || !elevenLabsKey) {
      throw new Error('Missing required API keys');
    }

    // Test audio generation
    console.log('Testing audio generation with ElevenLabs...');
    const testAudioResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}/stream`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsKey,
        },
        body: JSON.stringify({
          text: script || "This is a test audio message",
          model_id: "eleven_turbo_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    );

    console.log('Audio generation response status:', testAudioResponse.status);
    
    if (!testAudioResponse.ok) {
      const errorText = await testAudioResponse.text();
      console.error('ElevenLabs API Error:', errorText);
      throw new Error(`ElevenLabs API error: ${errorText}`);
    }

    // Test video generation with Replicate
    console.log('Testing video generation with Replicate...');
    const videoResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${replicateApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "85d775927d738f501d2b7fcc5f33d8566904f27d7b29960f1a8c0195220d1c7d",
        input: {
          prompt: script || "A serene mountain landscape",
          width: 768,
          height: 432,
          num_frames: 24,
          fps: 8,
        },
      }),
    });

    console.log('Video generation response status:', videoResponse.status);
    
    if (!videoResponse.ok) {
      const errorText = await videoResponse.text();
      console.error('Replicate API Error:', errorText);
      throw new Error(`Replicate API error: ${errorText}`);
    }

    const predictionData = await videoResponse.json();
    console.log('Video generation started. Prediction ID:', predictionData.id);

    // Return success response with test results
    return new Response(
      JSON.stringify({
        success: true,
        message: "API test completed successfully",
        audioTest: {
          status: testAudioResponse.status,
          ok: testAudioResponse.ok
        },
        videoTest: {
          status: videoResponse.status,
          predictionId: predictionData.id
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