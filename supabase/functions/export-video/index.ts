import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { generateAudioNarration } from "./audio.ts";
import { generateVideo } from "./video.ts";
import { uploadToStorage } from "./storage.ts";
import { initSupabaseAdmin } from "./supabase.ts";

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

    const supabaseAdmin = initSupabaseAdmin();

    const authHeader = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader);
    if (authError || !user) {
      throw new Error('Invalid authorization');
    }

    // Convert messages to narration script
    const script = messages.map((msg: any) => 
      `${msg.isUser ? 'User' : 'Friend'}: ${msg.content}`
    ).join('\n');

    // Generate audio narration
    console.log('Generating audio narration...');
    const audioData = await generateAudioNarration(script, voiceId);

    // Start video generation
    const prediction = await generateVideo(messages);
    const videoUrl = await pollVideoGeneration(prediction.id);

    // Download the generated video
    console.log('Downloading generated video...');
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      throw new Error('Failed to download generated video');
    }

    const videoData = await videoResponse.arrayBuffer();

    // Generate unique filenames
    const timestamp = Date.now();
    const videoFileName = `video-${timestamp}.mp4`;
    const audioFileName = `audio-${timestamp}.mp3`;

    // Upload both files to Supabase Storage
    await Promise.all([
      uploadToStorage(supabaseAdmin, videoFileName, videoData, 'video/mp4'),
      uploadToStorage(supabaseAdmin, audioFileName, audioData, 'audio/mpeg')
    ]);

    // Get public URL
    const { data: { publicUrl: videoPublicUrl } } = supabaseAdmin
      .storage
      .from('exports')
      .getPublicUrl(videoFileName);

    // Create export record
    const { data: exportData, error: exportError } = await supabaseAdmin
      .from('exports')
      .insert({
        user_id: user.id,
        title,
        description,
        file_url: videoFileName,
        file_type: 'video/mp4',
        file_size: videoData.byteLength,
        thumbnail_url: videoPublicUrl,
        status: 'completed'
      })
      .select()
      .single();

    if (exportError) {
      throw exportError;
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        export: exportData,
        message: "Video exported successfully" 
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