import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { decode as base64Decode } from "https://deno.land/std@0.182.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const video = formData.get('video') as File;
    const segmentsData = JSON.parse(formData.get('segments') as string);
    const userId = formData.get('userId') as string;
    const tempVideoId = formData.get('tempVideoId') as string;

    if (!video || !segmentsData || !userId || !tempVideoId) {
      throw new Error('Missing required fields');
    }

    console.log('Processing segments:', segmentsData);

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Upload original video to storage
    const videoExt = video.name.split('.').pop();
    const videoPath = `${crypto.randomUUID()}.${videoExt}`;
    
    console.log('Uploading original video:', videoPath);
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('exports')
      .upload(videoPath, video);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    // Get the public URL of the uploaded video
    const { data: { publicUrl: originalVideoUrl } } = supabase.storage
      .from('exports')
      .getPublicUrl(videoPath);

    console.log('Original video URL:', originalVideoUrl);

    // Process each segment
    for (const segment of segmentsData) {
      try {
        console.log('Processing segment:', segment.name);
        
        // Create segment record
        const { data: segmentRecord, error: segmentError } = await supabase
          .from('video_segments')
          .insert({
            temp_video_id: tempVideoId,
            user_id: userId,
            name: segment.name,
            start_time: segment.start,
            end_time: segment.end,
            status: 'processing'
          })
          .select()
          .single();

        if (segmentError) {
          console.error('Error creating segment record:', segmentError);
          throw segmentError;
        }

        // Calculate duration
        const duration = segment.end - segment.start;
        
        // Prepare FFmpeg command for vertical video (9:16 aspect ratio)
        const ffmpegCmd = [
          'ffmpeg',
          '-i', originalVideoUrl,
          '-ss', segment.start.toString(),
          '-t', duration.toString(),
          '-vf', 'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2',
          '-c:v', 'libx264',
          '-c:a', 'aac',
          '-y',
          `output_${segmentRecord.id}.mp4`
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
        const processedVideo = await Deno.readFile(`output_${segmentRecord.id}.mp4`);

        // Upload processed segment
        const segmentPath = `segments/${segmentRecord.id}.mp4`;
        const { error: segmentUploadError } = await supabase.storage
          .from('exports')
          .upload(segmentPath, processedVideo);

        if (segmentUploadError) {
          throw segmentUploadError;
        }

        // Get public URL for the segment
        const { data: { publicUrl: segmentUrl } } = supabase.storage
          .from('exports')
          .getPublicUrl(segmentPath);

        // Update segment record with URL and completed status
        const { error: updateError } = await supabase
          .from('video_segments')
          .update({ 
            status: 'completed',
            file_url: segmentUrl
          })
          .eq('id', segmentRecord.id);

        if (updateError) {
          throw updateError;
        }

        // Cleanup temporary file
        await Deno.remove(`output_${segmentRecord.id}.mp4`);

      } catch (error) {
        console.error('Error processing segment:', error);
        
        // Update segment status to failed
        await supabase
          .from('video_segments')
          .update({ status: 'failed' })
          .eq('temp_video_id', tempVideoId)
          .eq('name', segment.name);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Video split successfully',
        segments: segmentsData.length 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error processing video:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process video',
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