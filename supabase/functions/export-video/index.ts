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

    // Start video generation with Replicate
    console.log('Starting video generation with Replicate...');
    const replicateResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${Deno.env.get('REPLICATE_API_KEY')}`,
      },
      body: JSON.stringify({
        version: "2b017d9b67edd2ee1401238df49d75da53c523f36e363881e057f5dc3ed3c5b2",
        input: {
          prompt: messages.map(msg => msg.content).join(' '),
          num_frames: 50,
          width: 1024,
          height: 576,
          fps: 30,
          guidance_scale: 17.5,
        },
      }),
    });

    if (!replicateResponse.ok) {
      throw new Error(`Replicate API error: ${await replicateResponse.text()}`);
    }

    const prediction = await replicateResponse.json();
    console.log('Replicate prediction started:', prediction);

    // Poll for video generation completion
    let videoUrl = null;
    while (!videoUrl) {
      const statusResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            Authorization: `Token ${Deno.env.get('REPLICATE_API_KEY')}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!statusResponse.ok) {
        throw new Error(`Failed to check prediction status: ${await statusResponse.text()}`);
      }

      const status = await statusResponse.json();
      console.log('Prediction status:', status.status);

      if (status.status === 'succeeded') {
        videoUrl = status.output;
        break;
      } else if (status.status === 'failed') {
        throw new Error('Video generation failed');
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Download the generated video
    console.log('Downloading generated video...');
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      throw new Error('Failed to download generated video');
    }

    const videoBlob = await videoResponse.blob();
    const videoFileName = `video-${Date.now()}.mp4`;

    // Upload video to Supabase Storage
    console.log('Uploading video to Storage...');
    const { data: videoUpload, error: videoUploadError } = await supabaseAdmin
      .storage
      .from('exports')
      .upload(videoFileName, videoBlob, {
        contentType: 'video/mp4',
        upsert: true
      });

    if (videoUploadError) {
      console.error('Video upload error:', videoUploadError);
      throw videoUploadError;
    }

    // Get public URL for the video
    const { data: { publicUrl: videoUrl } } = supabaseAdmin
      .storage
      .from('exports')
      .getPublicUrl(videoFileName);

    // Create an export record
    console.log('Creating export record...');
    const { data: exportData, error: exportError } = await supabaseAdmin
      .from('exports')
      .insert({
        title,
        description,
        file_url: videoFileName,
        file_type: 'video/mp4',
        file_size: videoBlob.size,
        status: 'completed',
        user_id: user.id,
        thumbnail_url: videoUrl,
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