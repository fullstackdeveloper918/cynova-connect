import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
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
    const { messages, title, description, type, audioUrls } = await req.json();
    console.log('Received request:', { 
      messagesCount: messages.length, 
      title, 
      type,
      audioUrlsCount: audioUrls?.length 
    });

    const supabaseAdmin = initSupabaseAdmin();

    const authHeader = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader);
    if (authError || !user) {
      throw new Error('Invalid authorization');
    }

    // Generate HTML for the iMessage conversation with audio elements
    const conversationHtml = messages.map((msg: any, index: number) => `
      <div class="message ${msg.isUser ? 'user' : 'friend'}">
        <div class="bubble">
          ${msg.content}
          ${msg.audioUrl ? `<audio src="${msg.audioUrl}" autoplay></audio>` : ''}
        </div>
        <div class="timestamp">${new Date().toLocaleTimeString()}</div>
      </div>
    `).join('');

    const htmlTemplate = `
      <div class="conversation" style="
        background-color: #F5F5F5;
        padding: 20px;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      ">
        ${conversationHtml}
      </div>
    `;

    // Generate video using Replicate
    console.log('Starting video generation with Replicate...');
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${Deno.env.get('REPLICATE_API_KEY')}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "2b017d9b67edd2ee1401238df49d75da53c523f36e363881e057f5dc3ed3c5b2",
        input: {
          html: htmlTemplate,
          width: 1080,
          height: 1920,
          fps: 30,
          duration: messages.length * 2, // Adjust duration based on message count
          quality: "high",
          format: "mp4",
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Replicate API error: ${await response.text()}`);
    }

    const prediction = await response.json();
    console.log('Video generation started. Prediction ID:', prediction.id);

    // Poll for video completion
    let videoUrl = null;
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts && !videoUrl) {
      console.log(`Polling attempt ${attempts + 1}/${maxAttempts}`);
      const pollResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            Authorization: `Token ${Deno.env.get('REPLICATE_API_KEY')}`,
          },
        }
      );

      if (!pollResponse.ok) {
        throw new Error(`Failed to check prediction status: ${await pollResponse.text()}`);
      }

      const predictionStatus = await pollResponse.json();
      console.log('Prediction status:', predictionStatus.status);

      if (predictionStatus.status === 'succeeded') {
        videoUrl = predictionStatus.output;
        break;
      } else if (predictionStatus.status === 'failed') {
        throw new Error('Video generation failed');
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    if (!videoUrl) {
      throw new Error('Video generation timed out');
    }

    console.log('Video generated successfully:', videoUrl);

    // Download the video
    console.log('Downloading generated video...');
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      throw new Error('Failed to download generated video');
    }

    const videoData = await videoResponse.arrayBuffer();
    const timestamp = Date.now();
    const videoFileName = `fake-text-${timestamp}.mp4`;

    // Upload video to Supabase Storage
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