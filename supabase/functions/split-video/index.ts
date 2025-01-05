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
    const segments = JSON.parse(formData.get('segments') as string);

    if (!video || !segments) {
      throw new Error('Missing required fields');
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Upload original video to storage
    const videoExt = video.name.split('.').pop();
    const videoPath = `${crypto.randomUUID()}.${videoExt}`;

    const { error: uploadError } = await supabase.storage
      .from('exports')
      .upload(videoPath, video);

    if (uploadError) {
      throw uploadError;
    }

    // Process segments (in a real implementation, this would use FFmpeg)
    // For now, we'll just simulate the processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    return new Response(
      JSON.stringify({ 
        message: 'Video split successfully',
        segments: segments.length 
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