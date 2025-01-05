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
    const formData = await req.formData();
    const video = formData.get('video') as File;
    const segmentsData = JSON.parse(formData.get('segments') as string);
    const userId = formData.get('userId') as string;
    const tempVideoId = formData.get('tempVideoId') as string;

    if (!video || !segmentsData || !userId || !tempVideoId) {
      throw new Error('Missing required fields');
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Processing segments:', segmentsData);

    // Upload original video to storage
    const videoExt = video.name.split('.').pop();
    const videoPath = `${crypto.randomUUID()}.${videoExt}`;

    const { error: uploadError } = await supabase.storage
      .from('exports')
      .upload(videoPath, video);

    if (uploadError) {
      throw uploadError;
    }

    // Create segment records
    for (const segment of segmentsData) {
      const { error } = await supabase
        .from('video_segments')
        .insert({
          temp_video_id: tempVideoId,
          user_id: userId,
          name: segment.name,
          start_time: segment.start,
          end_time: segment.end,
          status: 'processing'
        });

      if (error) {
        console.error('Error creating segment:', error);
        throw error;
      }
    }

    // In a real implementation, this would use FFmpeg to split the video
    // For now, we'll simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update segments to completed
    const { error: updateError } = await supabase
      .from('video_segments')
      .update({ status: 'completed' })
      .eq('temp_video_id', tempVideoId);

    if (updateError) {
      throw updateError;
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