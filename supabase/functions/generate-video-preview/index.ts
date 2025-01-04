import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { generateAudio } from "./audioService.ts";
import { generateImage } from "./imageService.ts";
import { uploadToStorage } from "./storageService.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting preview generation process...');
    
    const { script, voice = "Sarah" } = await req.json();
    console.log('Received request payload:', { script, voice });

    if (!script || script.trim().length === 0) {
      throw new Error('Script is required and cannot be empty');
    }

    // Get required API keys and URLs
    const elevenLabsKey = Deno.env.get('ELEVEN_LABS_API_KEY');
    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!elevenLabsKey || !openAiKey || !supabaseUrl || !supabaseKey) {
      throw new Error('Missing required API keys or configuration');
    }

    // Generate image and audio in parallel
    const [audioResponse, imageUrl] = await Promise.all([
      generateAudio(script, voice, elevenLabsKey),
      generateImage(script, openAiKey)
    ]);

    // Upload audio to storage
    const audioBlob = await audioResponse.blob();
    const audioArrayBuffer = await audioBlob.arrayBuffer();
    const audioFileName = `audio-${Date.now()}.mp3`;
    const audioUrl = await uploadToStorage(
      audioFileName,
      audioArrayBuffer,
      'audio/mpeg',
      supabaseUrl,
      supabaseKey
    );

    console.log('Generation completed successfully');
    return new Response(
      JSON.stringify({ 
        previewUrl: {
          videoUrl: imageUrl, // For now, we're using a static image
          audioUrl
        },
        message: "Preview generated successfully" 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-video-preview function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate preview',
        details: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});