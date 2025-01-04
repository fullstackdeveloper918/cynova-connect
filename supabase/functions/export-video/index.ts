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

  return await response.arrayBuffer();
};

// Generate video using Replicate
const generateVideo = async (messages: any[]) => {
  console.log('Starting video generation with Replicate...');
  
  // Create HTML representation of the iMessage conversation
  const conversationHtml = messages.map(msg => `
    <div class="message ${msg.isUser ? 'user' : 'friend'}">
      <div class="bubble">
        ${msg.content}
      </div>
      <div class="timestamp">${msg.timestamp}</div>
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

  // Use Replicate to create video from HTML
  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${Deno.env.get('REPLICATE_API_KEY')}`,
    },
    body: JSON.stringify({
      version: "2b017d9b67edd2ee1401238df49d75da53c523f36e363881e057f5dc3ed3c5b2",
      input: {
        html: htmlTemplate,
        width: 1080,
        height: 1920,
        fps: 30,
        duration: 10, // Adjust based on conversation length
        quality: "high",
        format: "mp4",
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

// Upload file to Supabase Storage
const uploadToStorage = async (
  supabaseAdmin: any,
  fileName: string,
  data: ArrayBuffer,
  contentType: string
) => {
  console.log(`Uploading ${contentType} to Storage...`);
  const blob = new Blob([data], { type: contentType });
  const { data: uploadData, error } = await supabaseAdmin
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

  return uploadData;
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