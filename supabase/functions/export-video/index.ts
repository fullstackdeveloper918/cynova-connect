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
    console.log('Starting export-video function...');
    const { messages, voiceId, title, description } = await req.json();
    console.log('Received request:', { messagesCount: messages.length, voiceId, title });

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
    let audioData;
    try {
      audioData = await generateAudioNarration(script, voiceId);
      console.log('Audio narration generated successfully');
    } catch (error) {
      console.error('Audio generation error:', error);
      throw new Error(`Failed to generate audio narration: ${error.message}`);
    }

    // Start video generation
    console.log('Starting video generation...');
    let videoUrl;
    try {
      const prediction = await generateVideo(messages);
      videoUrl = await pollVideoGeneration(prediction.id);
      console.log('Video generated successfully');
    } catch (error) {
      console.error('Video generation error:', error);
      throw new Error(`Failed to generate video: ${error.message}`);
    }

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
    console.log('Uploading files to storage...');
    try {
      await Promise.all([
        uploadToStorage(supabaseAdmin, videoFileName, videoData, 'video/mp4'),
        uploadToStorage(supabaseAdmin, audioFileName, audioData, 'audio/mpeg')
      ]);
      console.log('Files uploaded successfully');
    } catch (error) {
      console.error('Storage upload error:', error);
      throw new Error(`Failed to upload files: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl: videoPublicUrl } } = supabaseAdmin
      .storage
      .from('exports')
      .getPublicUrl(videoFileName);

    // Create export record
    console.log('Creating export record...');
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
      console.error('Export record creation error:', exportError);
      throw exportError;
    }

    console.log('Export completed successfully');
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

// Poll for video generation completion
const pollVideoGeneration = async (predictionId: string): Promise<string> => {
  console.log('Polling for video generation completion...');
  let attempts = 0;
  const maxAttempts = 60;

  while (attempts < maxAttempts) {
    const response = await fetch(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      {
        headers: {
          Authorization: `Token ${Deno.env.get('REPLICATE_API_KEY')}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to check prediction status: ${await response.text()}`);
    }

    const prediction = await response.json();
    console.log('Prediction status:', prediction.status);

    if (prediction.status === 'succeeded') {
      return prediction.output;
    } else if (prediction.status === 'failed') {
      throw new Error('Video generation failed');
    }

    attempts++;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  throw new Error('Video generation timed out');
};