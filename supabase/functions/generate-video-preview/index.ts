import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { script, voice } = await req.json();
    console.log('Received script:', script);
    console.log('Selected voice:', voice);

    if (!script) {
      throw new Error('No script provided');
    }

    // Initialize Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Call Replicate API to generate video content
    const replicateResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${Deno.env.get('REPLICATE_API_KEY')}`,
      },
      body: JSON.stringify({
        version: "4d1cf0c5da3c6e10c75fb7886f5c4c4c1ff55ed2983df0d8c5da25c2351b4297",
        input: {
          prompt: script,
          num_frames: 50,
          fps: 24,
        },
      }),
    });

    if (!replicateResponse.ok) {
      const error = await replicateResponse.json();
      console.error('Replicate API Error:', error);
      throw new Error('Failed to generate video content');
    }

    const prediction = await replicateResponse.json();
    console.log('Prediction started:', prediction);

    // Poll for the result
    let videoUrl = null;
    while (!videoUrl) {
      const statusResponse = await fetch(prediction.urls.get, {
        headers: {
          Authorization: `Token ${Deno.env.get('REPLICATE_API_KEY')}`,
        },
      });
      
      const result = await statusResponse.json();
      console.log('Checking prediction status:', result);

      if (result.status === 'succeeded') {
        videoUrl = result.output;
        break;
      } else if (result.status === 'failed') {
        throw new Error('Video generation failed');
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Download the generated video
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      throw new Error('Failed to download generated video');
    }

    const videoBlob = await videoResponse.blob();
    const timestamp = new Date().getTime();
    const fileName = `preview-${timestamp}.mp4`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('exports')
      .upload(fileName, videoBlob, {
        contentType: 'video/mp4',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    // Get the public URL
    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from('exports')
      .getPublicUrl(fileName);

    console.log('Preview URL:', publicUrl);

    return new Response(
      JSON.stringify({ 
        previewUrl: publicUrl,
        message: "Preview generated successfully" 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in generate-video-preview function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate video preview',
        details: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});