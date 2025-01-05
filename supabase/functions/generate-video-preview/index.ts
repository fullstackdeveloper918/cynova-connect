import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { generateAudio } from "./audioService.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting video preview generation...');
    
    const { script, voice, duration } = await req.json();
    
    if (!script) {
      throw new Error('Script is required');
    }

    console.log('Generating audio with script length:', script.length);

    // Generate audio using ElevenLabs
    const elevenLabsKey = Deno.env.get('ELEVEN_LABS_API_KEY');
    if (!elevenLabsKey) {
      throw new Error('ELEVEN_LABS_API_KEY is not set');
    }

    // Generate audio narration
    const audioResponse = await generateAudio(script, voice, elevenLabsKey);
    
    if (!audioResponse.ok) {
      const error = await audioResponse.text();
      console.error('ElevenLabs API Error:', error);
      throw new Error(`ElevenLabs API error: ${error}`);
    }

    const audioBuffer = await audioResponse.arrayBuffer();

    console.log('Audio generated successfully, uploading to storage...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables are not set');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Upload audio file to storage
    const timestamp = new Date().getTime();
    const audioFileName = `preview-audio-${timestamp}.mp3`;
    
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

    console.log('Audio uploaded successfully:', audioUrl);

    // For now, we're using a template video. In a full implementation,
    // you might want to generate or select a specific video based on the content
    const videoUrl = "/stock/minecraft-gameplay.mp4";

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
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error in generate-video-preview:', error);
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