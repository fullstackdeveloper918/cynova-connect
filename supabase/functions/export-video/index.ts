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

    // Generate video frames for the messages
    const frames = messages.map((msg, index) => {
      const canvas = new OffscreenCanvas(1280, 720);
      const ctx = canvas.getContext('2d');
      
      // Set background
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add message bubble
      ctx.fillStyle = msg.isUser ? '#4a9eff' : '#2a2a2a';
      ctx.roundRect(100, 260, canvas.width - 200, 200, 20);
      ctx.fill();
      
      // Add text
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      
      // Word wrap text
      const words = msg.content.split(' ');
      let line = '';
      let y = 320;
      words.forEach(word => {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > canvas.width - 300) {
          ctx.fillText(line, 130, y);
          line = word + ' ';
          y += 40;
        } else {
          line = testLine;
        }
      });
      ctx.fillText(line, 130, y);
      
      return canvas.convertToBlob();
    });

    // Create video from frames using WebCodecs API
    const videoEncoder = new VideoEncoder({
      output: chunk => {
        // Handle encoded video chunks
      },
      error: e => {
        console.error(e);
      }
    });

    const videoConfig = {
      codec: 'vp8',
      width: 1280,
      height: 720,
      bitrate: 1_000_000,
      framerate: 30,
    };

    videoEncoder.configure(videoConfig);

    // Encode frames
    for (let i = 0; i < frames.length; i++) {
      const frame = await createVideoFrame(frames[i], i * (1000 / videoConfig.framerate));
      videoEncoder.encode(frame);
      frame.close();
    }

    await videoEncoder.flush();
    videoEncoder.close();

    // Combine audio and video
    const finalVideoBlob = new Blob([videoEncoder.output, audioBlob], { type: 'video/webm' });
    
    // Upload to Supabase Storage
    const videoFileName = `video-${Date.now()}.webm`;
    const { data: videoUpload, error: videoUploadError } = await supabaseAdmin
      .storage
      .from('exports')
      .upload(videoFileName, finalVideoBlob, {
        contentType: 'video/webm',
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

    // Create an export record with user_id
    console.log('Creating export record...');
    const { data: exportData, error: exportError } = await supabaseAdmin
      .from('exports')
      .insert({
        title,
        description,
        file_url: videoFileName,
        file_type: 'video/webm',
        file_size: finalVideoBlob.size,
        status: 'completed',
        user_id: user.id,
        thumbnail_url: videoUrl, // We can generate thumbnails in the future
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

// Helper function to create video frames
async function createVideoFrame(imageBlob: Blob, timestamp: number) {
  const imageBitmap = await createImageBitmap(imageBlob);
  const frame = new VideoFrame(imageBitmap, {
    timestamp: timestamp * 1000, // microseconds
  });
  imageBitmap.close();
  return frame;
}