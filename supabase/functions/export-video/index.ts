import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { generateVideo, pollVideoGeneration } from "./videoService.ts";
import { generateConversationHtml } from "./htmlGenerator.ts";
import { initSupabaseAdmin } from "./supabase.ts";
import { uploadToStorage } from "./storage.ts";

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
    const { messages, title, description, type, audioUrls } = await req.json();
    console.log('Received request:', { 
      messagesCount: messages.length, 
      title, 
      type,
      audioUrlsCount: audioUrls?.length 
    });

    const supabaseAdmin = initSupabaseAdmin();
    const replicateApiKey = Deno.env.get('REPLICATE_API_KEY');
    if (!replicateApiKey) {
      throw new Error('REPLICATE_API_KEY is not set');
    }

    // Verify user authentication
    const authHeader = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader);
    if (authError || !user) {
      throw new Error('Invalid authorization');
    }

    // Generate HTML and create video
    const htmlTemplate = generateConversationHtml(messages);
    const prediction = await generateVideo(replicateApiKey, htmlTemplate, messages.length * 2);
    const videoUrl = await pollVideoGeneration(replicateApiKey, prediction.id);

    if (!videoUrl) {
      throw new Error('Failed to generate video URL');
    }

    console.log('Video generated successfully:', videoUrl);

    // Download and upload video
    console.log('Downloading generated video...');
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      throw new Error('Failed to download generated video');
    }

    const videoData = await videoResponse.arrayBuffer();
    const timestamp = Date.now();
    const videoFileName = `fake-text-${timestamp}.mp4`;

    // Upload video to storage
    console.log('Uploading video to storage...');
    try {
      await uploadToStorage(supabaseAdmin, videoFileName, videoData, 'video/mp4');
      console.log('Video uploaded successfully');
    } catch (error) {
      console.error('Storage upload error:', error);
      throw new Error(`Failed to upload video: ${error.message}`);
    }

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
        thumbnail_url: videoUrl,
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