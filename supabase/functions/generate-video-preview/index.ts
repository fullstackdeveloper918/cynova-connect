import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client for the edge function
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting video generation process...');
    
    const { script, voice = "Sarah", duration = "48" } = await req.json();
    console.log('Received request payload:', { script, voice, duration });

    if (!script || script.trim().length === 0) {
      throw new Error('Script is required and cannot be empty');
    }

    if (script.length > 5000) {
      throw new Error('Script is too long. Please keep it under 5000 characters for optimal processing.');
    }

    // Extract just the narration parts from the script for audio
    const narrationParts = script.match(/\*Narration:\* "(.*?)"/g)?.map(part => 
      part.replace(/\*Narration:\* "/, '').replace(/"$/, '')
    ).join(' ') || script;

    // Extract visual descriptions for video generation
    const visualParts = script.match(/\*Visual Description:\* (.*?)(?=\n|$)/g)?.map(part =>
      part.replace(/\*Visual Description:\* /, '')
    ).join('. ') || script;

    console.log('Extracted narration:', narrationParts);
    console.log('Extracted visual descriptions:', visualParts);

    // Generate video description with OpenAI
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
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Create a detailed visual description for video generation. Focus on describing concrete visual elements, camera movements, and scene composition. Be specific and avoid abstract concepts.'
          },
          {
            role: 'user',
            content: `Create a detailed visual description for a video based on these visual elements: ${visualParts}`
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

    // Generate audio narration using ElevenLabs
    console.log('Generating audio narration with ElevenLabs...');
    const elevenLabsKey = Deno.env.get('ELEVEN_LABS_API_KEY');
    if (!elevenLabsKey) {
      throw new Error('ELEVEN_LABS_API_KEY is not set');
    }

    const voiceId = "EXAVITQu4vr4xnSDxMaL"; // Sarah's voice ID
    const audioResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsKey,
        },
        body: JSON.stringify({
          text: narrationParts,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    );

    if (!audioResponse.ok) {
      const error = await audioResponse.text();
      console.error('ElevenLabs API Error:', error);
      throw new Error(`ElevenLabs API error: ${error}`);
    }

    const audioBlob = await audioResponse.blob();
    const audioArrayBuffer = await audioBlob.arrayBuffer();

    // Upload audio to Supabase Storage
    const audioFileName = `audio-${Date.now()}.mp3`;
    const { data: audioUploadData, error: audioUploadError } = await supabaseAdmin
      .storage
      .from('exports')
      .upload(audioFileName, audioArrayBuffer, {
        contentType: 'audio/mpeg',
        upsert: true
      });

    if (audioUploadError) {
      console.error('Audio upload error:', audioUploadError);
      throw audioUploadError;
    }

    // Get public URL for audio
    const { data: { publicUrl: audioUrl } } = supabaseAdmin
      .storage
      .from('exports')
      .getPublicUrl(audioFileName);

    // Use Replicate's API for video generation with optimized settings
    const replicateApiKey = Deno.env.get('REPLICATE_API_KEY');
    if (!replicateApiKey) {
      throw new Error('REPLICATE_API_KEY is not set');
    }

    console.log('Starting video generation with Replicate...');
    
    // Using an optimized model version for better memory efficiency
    const modelVersion = "71996d331e8ede8ef7bd76eba9fae076d31792e4ddf4ad057779b443d6aea62f";
    
    console.log('Using Replicate model version:', modelVersion);
    console.log('Video description being sent:', videoDescription);
    
    const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: "POST",
      headers: {
        "Authorization": `Token ${replicateApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: modelVersion,
        input: {
          prompt: videoDescription,
          num_frames: Math.min(24 * 15, parseInt(duration)), // Reduced number of frames
          fps: 12, // Reduced FPS
          width: 512, // Reduced resolution
          height: 512,
          guidance_scale: 12.5, // Reduced guidance scale
          num_inference_steps: 30, // Reduced inference steps
          negative_prompt: "blurry, low quality, low resolution, bad quality, ugly, duplicate frames, text, watermark, logo, words",
          scheduler: "K_EULER",
          seed: Math.floor(Math.random() * 1000000),
        },
      }),
    });

    if (!replicateResponse.ok) {
      const error = await replicateResponse.json();
      console.error('Replicate API Error:', error);
      throw new Error(`Replicate API error: ${JSON.stringify(error)}`);
    }

    const prediction = await replicateResponse.json();
    console.log('Prediction created:', prediction);

    // Poll for completion with better error handling
    const maxAttempts = 180; // 3 minutes
    const pollInterval = 2000; // Poll every 2 seconds
    let attempts = 0;

    while (attempts < maxAttempts) {
      console.log(`Polling attempt ${attempts + 1}/${maxAttempts} for prediction ${prediction.id}`);
      
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
      console.log(`Poll result status for ${prediction.id}:`, result.status);

      if (result.status === "succeeded") {
        console.log('Video generation succeeded:', result);
        
        return new Response(
          JSON.stringify({ 
            previewUrl: {
              videoUrl: result.output,
              audioUrl: audioUrl
            },
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

      await new Promise(resolve => setTimeout(resolve, pollInterval));
      attempts++;
    }

    throw new Error(`Video generation timed out after ${maxAttempts * pollInterval / 1000} seconds`);

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