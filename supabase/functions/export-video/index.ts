import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase admin client
const initSupabaseAdmin = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
};

// Generate audio narration using ElevenLabs
const generateAudioNarration = async (script: string, voiceId: string) => {
  console.log('Generating audio with ElevenLabs...');
  const response = await fetch(
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

  if (!response.ok) {
    const error = await response.json();
    console.error('ElevenLabs API Error:', error);
    throw new Error('Failed to generate audio narration');
  }

  return response;
};

// Generate video using Replicate
const generateVideo = async (prompt: string) => {
  console.log('Starting video generation with Replicate...');
  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${Deno.env.get('REPLICATE_API_KEY')}`,
    },
    body: JSON.stringify({
      version: "2b017d9b67edd2ee1401238df49d75da53c523f36e363881e057f5dc3ed3c5b2",
      input: {
        prompt,
        num_frames: 50,
        width: 1024,
        height: 576,
        fps: 30,
        guidance_scale: 17.5,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Replicate API error: ${await response.text()}`);
  }

  return await response.json();
};

// Poll for video generation completion
const pollVideoGeneration = async (predictionId: string): Promise<string> => {
  console.log('Polling for video generation completion...');
  let attempts = 0;
  const maxAttempts = 30; // 30 seconds timeout

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

    const status = await response.json();
    console.log('Prediction status:', status.status);

    if (status.status === 'succeeded') {
      return status.output;
    } else if (status.status === 'failed') {
      throw new Error('Video generation failed');
    }

    attempts++;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  throw new Error('Video generation timed out');
};

// Upload file to Supabase Storage
const uploadToStorage = async (
  supabaseAdmin: any,
  fileName: string,
  blob: Blob,
  contentType: string
) => {
  console.log(`Uploading ${contentType} to Storage...`);
  const { data, error } = await supabaseAdmin
    .storage
    .from('exports')
    .upload(fileName, blob, {
      contentType,
      upsert: true
    });

  if (error) {
    console.error('Upload error:', error);
    throw error;
  }

  return data;
};

// Create export record in database
const createExportRecord = async (
  supabaseAdmin: any,
  {
    title,
    description,
    fileName,
    fileType,
    fileSize,
    userId,
    thumbnailUrl,
  }: {
    title: string;
    description: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    userId: string;
    thumbnailUrl: string;
  }
) => {
  console.log('Creating export record...');
  const { data, error } = await supabaseAdmin
    .from('exports')
    .insert({
      title,
      description,
      file_url: fileName,
      file_type: fileType,
      file_size: fileSize,
      status: 'completed',
      user_id: userId,
      thumbnail_url: thumbnailUrl,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating export record:', error);
    throw error;
  }

  return data;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, voiceId, title, description } = await req.json();
    console.log('Received request:', { messages, voiceId, title });

    // Initialize Supabase admin client
    const supabaseAdmin = initSupabaseAdmin();

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
    const script = messages.map((msg: any) => 
      `${msg.isUser ? 'User' : 'Friend'}: ${msg.content}`
    ).join('\n');

    // Generate audio narration
    const audioResponse = await generateAudioNarration(script, voiceId);

    // Start video generation
    const prediction = await generateVideo(messages.map((msg: any) => msg.content).join(' '));
    const videoUrl = await pollVideoGeneration(prediction.id);

    // Download the generated video
    console.log('Downloading generated video...');
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      throw new Error('Failed to download generated video');
    }

    const videoBlob = await videoResponse.blob();
    const videoFileName = `video-${Date.now()}.mp4`;

    // Upload video to Supabase Storage
    await uploadToStorage(supabaseAdmin, videoFileName, videoBlob, 'video/mp4');

    // Get public URL for the video
    const { data: { publicUrl: publicVideoUrl } } = supabaseAdmin
      .storage
      .from('exports')
      .getPublicUrl(videoFileName);

    // Create export record
    const exportData = await createExportRecord(supabaseAdmin, {
      title,
      description,
      fileName: videoFileName,
      fileType: 'video/mp4',
      fileSize: videoBlob.size,
      userId: user.id,
      thumbnailUrl: publicVideoUrl,
    });

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