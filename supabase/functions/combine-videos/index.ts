import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { segmentId, gameplayUrl } = await req.json();

    if (!segmentId || !gameplayUrl) {
      throw new Error('Missing required fields');
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get segment details
    const { data: segment, error: segmentError } = await supabase
      .from('video_segments')
      .select('*')
      .eq('id', segmentId)
      .single();

    if (segmentError) throw segmentError;

    // Prepare FFmpeg command for combining videos
    const outputPath = `combined_${segmentId}.mp4`;
    const ffmpegCmd = [
      'ffmpeg',
      '-i', gameplayUrl,
      '-i', segment.file_url,
      '-filter_complex', '[0:v]scale=1080:1920[top];[1:v]scale=1080:960[bottom];[top][bottom]vstack',
      '-c:v', 'libx264',
      '-c:a', 'aac',
      '-y',
      outputPath
    ];

    // Execute FFmpeg command
    const process = new Deno.Command(ffmpegCmd[0], {
      args: ffmpegCmd.slice(1),
    });

    const { success } = await process.output();

    if (!success) {
      throw new Error('FFmpeg processing failed');
    }

    // Read the processed file
    const processedVideo = await Deno.readFile(outputPath);

    // Upload combined video
    const combinedPath = `combined/${segmentId}.mp4`;
    const { error: uploadError } = await supabase.storage
      .from('exports')
      .upload(combinedPath, processedVideo);

    if (uploadError) throw uploadError;

    // Get public URL for the combined video
    const { data: { publicUrl: combinedUrl } } = supabase.storage
      .from('exports')
      .getPublicUrl(combinedPath);

    // Update segment record
    const { error: updateError } = await supabase
      .from('video_segments')
      .update({
        combined_url: combinedUrl,
        is_combined: true,
        status: 'completed'
      })
      .eq('id', segmentId);

    if (updateError) throw updateError;

    // Cleanup temporary file
    await Deno.remove(outputPath);

    return new Response(
      JSON.stringify({ 
        message: 'Videos combined successfully',
        combinedUrl 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error combining videos:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to combine videos',
        details: error.message
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    );
  }
});