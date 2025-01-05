import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { optionA, optionB, voiceId = "21m00Tcm4TlvDq8ikWAM" } = await req.json();
    
    if (!optionA || !optionB) {
      throw new Error('Both options are required');
    }

    console.log('Generating would you rather video with options:', { optionA, optionB });

    // Generate script for narration
    const script = `Would you rather ${optionA}? Or would you rather ${optionB}? Comment below with your choice!`;

    // Generate images using Hugging Face's FLUX model
    console.log('Generating images using Hugging Face FLUX model...');
    
    const generateImage = async (prompt: string) => {
      const hf = new HfInference(Deno.env.get('HUGGING_FACE_ACCESS_TOKEN'))
      
      console.log('Generating image for prompt:', prompt);
      
      const image = await hf.textToImage({
        inputs: `Create a cinematic, photorealistic image that captures this scene: "${prompt}". Make it dramatic and visually striking, suitable for a social media video. Vertical format, high detail, dramatic lighting.`,
        model: 'black-forest-labs/FLUX.1-schnell',
      })

      // Convert blob to base64
      const arrayBuffer = await image.arrayBuffer()
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
      return `data:image/png;base64,${base64}`;
    };

    // Generate images in parallel
    const [imageAUrl, imageBUrl] = await Promise.all([
      generateImage(optionA),
      generateImage(optionB)
    ]);

    console.log('Images generated successfully');

    // Generate audio narration using ElevenLabs
    const elevenLabsKey = Deno.env.get('ELEVEN_LABS_API_KEY');
    if (!elevenLabsKey) {
      throw new Error('ELEVEN_LABS_API_KEY is not set');
    }

    console.log('Generating audio narration...');
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
      const error = await audioResponse.text();
      console.error('ElevenLabs API Error:', error);
      throw new Error(`ElevenLabs API error: ${error}`);
    }

    const audioBuffer = await audioResponse.arrayBuffer();

    // Initialize Supabase client for storage
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables are not set');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Upload audio file to storage
    const timestamp = new Date().getTime();
    const audioFileName = `wyr-audio-${timestamp}.mp3`;
    
    const { error: audioError } = await supabase
      .storage
      .from('exports')
      .upload(audioFileName, new Uint8Array(audioBuffer), {
        contentType: 'audio/mpeg',
        upsert: true
      });

    if (audioError) {
      console.error('Audio upload error:', audioError);
      throw audioError;
    }

    // Get public URL for the audio file
    const { data: { publicUrl: audioUrl } } = supabase
      .storage
      .from('exports')
      .getPublicUrl(audioFileName);

    // Convert data URLs to Blob and upload to Supabase storage
    const uploadImage = async (dataUrl: string, prefix: string) => {
      // Remove the data URL prefix to get the base64 string
      const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
      const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      const imageFileName = `wyr-${prefix}-${timestamp}.png`;
      
      await supabase
        .storage
        .from('exports')
        .upload(imageFileName, binaryData, {
          contentType: 'image/png',
          upsert: true
        });

      return supabase
        .storage
        .from('exports')
        .getPublicUrl(imageFileName)
        .data
        .publicUrl;
    };

    const [optionAImageUrl, optionBImageUrl] = await Promise.all([
      uploadImage(imageAUrl, 'optionA'),
      uploadImage(imageBUrl, 'optionB')
    ]);

    console.log('All assets generated and uploaded successfully');

    return new Response(
      JSON.stringify({
        success: true,
        audioUrl,
        frames: [optionAImageUrl, optionBImageUrl],
        script
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error in generate-would-you-rather:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});