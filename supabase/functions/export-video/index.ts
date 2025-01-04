import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, voiceId, title, description } = await req.json();
    console.log('Received request:', { messages, voiceId, title });

    // Initialize Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the user ID from the authorization header
    const authHeader = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the JWT and get the user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader);
    if (authError || !user) {
      throw new Error('Invalid authorization');
    }

    // Convert messages to narration script
    const script = messages.map(msg => 
      `${msg.isUser ? 'User' : 'Friend'}: ${msg.content}`
    ).join('\n');

    // Generate audio narration using ElevenLabs
    console.log('Generating audio with ElevenLabs...');
    const audioResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': Deno.env.get('ELEVEN_LABS_API_KEY') ?? '',
        },
        body: JSON.stringify({
          text: script,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    );

    if (!audioResponse.ok) {
      const error = await audioResponse.json();
      console.error('ElevenLabs API Error:', error);
      throw new Error('Failed to generate audio');
    }

    const audioBlob = await audioResponse.blob();
    const audioFileName = `audio-${Date.now()}.mp3`;

    // Upload audio to Supabase Storage
    console.log('Uploading audio to Storage...');
    const { data: audioUpload, error: audioUploadError } = await supabaseAdmin
      .storage
      .from('exports')
      .upload(audioFileName, audioBlob, {
        contentType: 'audio/mpeg',
        upsert: true
      });

    if (audioUploadError) {
      console.error('Audio upload error:', audioUploadError);
      throw audioUploadError;
    }

    // Get public URL for the audio
    const { data: { publicUrl: audioUrl } } = supabaseAdmin
      .storage
      .from('exports')
      .getPublicUrl(audioFileName);

    // Create an export record
    console.log('Creating export record...');
    const { data: exportData, error: exportError } = await supabaseAdmin
      .from('exports')
      .insert({
        title,
        description,
        file_url: audioFileName,
        file_type: 'audio/mpeg',
        file_size: audioBlob.size,
        status: 'completed',
        user_id: user.id,
        thumbnail_url: 'https://placehold.co/600x400/png', // Default thumbnail
      })
      .select()
      .single();

    if (exportError) {
      console.error('Error creating export record:', exportError);
      throw exportError;
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        export: exportData,
        message: "Audio exported successfully" 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error in export-video function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to export video',
        details: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});