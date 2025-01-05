import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { generateAudio } from "./audioService.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { script, voice, duration } = await req.json();
    
    if (!script) {
      throw new Error('Script is required');
    }

    console.log('Starting audio generation with script:', script.substring(0, 100) + '...');

    // Generate audio using ElevenLabs
    const elevenLabsKey = Deno.env.get('ELEVEN_LABS_API_KEY');
    if (!elevenLabsKey) {
      throw new Error('ELEVEN_LABS_API_KEY is not set');
    }

    // Generate audio narration
    const audioResponse = await generateAudio(script, voice, elevenLabsKey);
    const audioBuffer = await audioResponse.arrayBuffer();
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

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
      .upload(audioFileName, decode(audioBase64), {
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

    console.log('Audio uploaded successfully, returning preview URLs...');

    // Return the template video URL along with the generated audio URL
    return new Response(
      JSON.stringify({
        success: true,
        previewUrl: {
          videoUrl: "/stock/minecraft-gameplay.mp4", // Using template video
          audioUrl: audioUrl
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