import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { generateAudio } from "./audioService.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS
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

    // Generate audio narration using ElevenLabs
    const elevenLabsKey = Deno.env.get('ELEVEN_LABS_API_KEY');
    if (!elevenLabsKey) {
      throw new Error('ELEVEN_LABS_API_KEY is not set');
    }

    console.log('Generating audio narration...');
    const audioResponse = await generateAudio(script, voiceId, elevenLabsKey);
    
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

    console.log('Audio generated and uploaded successfully:', audioUrl);

    return new Response(
      JSON.stringify({
        success: true,
        audioUrl,
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