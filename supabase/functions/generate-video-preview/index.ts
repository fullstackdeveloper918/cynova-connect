import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from '@supabase/supabase-js';
import { generateAudio } from "./audioService.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { script, voice, duration } = await req.json();
    
    if (!script) {
      throw new Error('Script is required');
    }

    console.log('Starting video generation with script:', script.substring(0, 100) + '...');

    // Generate audio using ElevenLabs
    const elevenLabsKey = Deno.env.get('ELEVEN_LABS_API_KEY');
    if (!elevenLabsKey) {
      throw new Error('ELEVEN_LABS_API_KEY is not set');
    }

    console.log('Generating audio with ElevenLabs...');
    const audioResponse = await generateAudio(script, voice, elevenLabsKey);
    const audioBuffer = await audioResponse.arrayBuffer();
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    console.log('Audio generated successfully, uploading to storage...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const timestamp = Date.now();
    const audioFileName = `preview-audio-${timestamp}.mp3`;

    // Upload audio to Supabase Storage
    const { data: audioData, error: audioError } = await supabase.storage
      .from('exports')
      .upload(audioFileName, Buffer.from(audioBuffer), {
        contentType: 'audio/mpeg',
        upsert: true
      });

    if (audioError) {
      console.error('Audio upload error:', audioError);
      throw audioError;
    }

    // Get public URL for the audio
    const { data: { publicUrl: audioUrl } } = supabase.storage
      .from('exports')
      .getPublicUrl(audioFileName);

    console.log('Audio uploaded successfully, generating video...');

    // Generate preview video using Replicate
    const replicateApiKey = Deno.env.get('REPLICATE_API_KEY');
    if (!replicateApiKey) {
      throw new Error('REPLICATE_API_KEY is not set');
    }

    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${replicateApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "2b017d9b67edd2ee1401238df49d75da53c523f36e363881e057f5dc3ed3c5b2",
        input: {
          html: `
            <div style="width: 1080px; height: 1920px; background: linear-gradient(180deg, #000000 0%, #1a1a1a 100%); display: flex; flex-direction: column; justify-content: flex-start; align-items: center; padding: 40px; font-family: system-ui, -apple-system, sans-serif;">
              <div style="width: 100%; max-width: 900px; background: rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 24px; margin-bottom: 40px;">
                <div style="color: white; font-size: 28px; line-height: 1.4; font-weight: 600; text-align: left;">
                  ${script.split('\n\n')[0]}
                </div>
              </div>
              <div style="width: 100%; max-width: 900px;">
                <div style="color: white; font-size: 24px; line-height: 1.5; text-align: center; background: rgba(0, 0, 0, 0.7); padding: 20px; border-radius: 12px;">
                  ${script.split('\n\n').slice(1).join('\n\n')}
                </div>
              </div>
            </div>
          `,
          width: 1080,
          height: 1920,
          fps: 30,
          duration: parseInt(duration) || 30,
          quality: "medium",
          format: "mp4"
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Replicate API error:', error);
      throw new Error(`Replicate API error: ${error}`);
    }

    const prediction = await response.json();
    console.log('Video generation started:', prediction);

    // Poll for video completion
    let videoUrl = null;
    const maxAttempts = 60;
    let attempts = 0;

    while (!videoUrl && attempts < maxAttempts) {
      console.log(`Polling attempt ${attempts + 1}/${maxAttempts}`);
      const pollResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            Authorization: `Token ${replicateApiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!pollResponse.ok) {
        throw new Error(`Failed to check prediction status: ${await pollResponse.text()}`);
      }

      const pollResult = await pollResponse.json();
      console.log('Poll result:', pollResult);

      if (pollResult.status === 'succeeded') {
        videoUrl = pollResult.output;
        break;
      } else if (pollResult.status === 'failed') {
        throw new Error('Video generation failed: ' + pollResult.error);
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    if (!videoUrl) {
      throw new Error('Video generation timed out');
    }

    console.log('Preview generation completed successfully');
    return new Response(
      JSON.stringify({
        success: true,
        previewUrl: {
          videoUrl,
          audioUrl
        }
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error in generate-video-preview:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});