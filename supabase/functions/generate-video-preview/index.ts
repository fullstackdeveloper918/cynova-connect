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

    const replicateApiKey = Deno.env.get('REPLICATE_API_KEY');
    if (!replicateApiKey) {
      throw new Error('REPLICATE_API_KEY is not set');
    }

    console.log('Calling Replicate API to generate video...');
    
    // Call Replicate API to generate video content using Zeroscope model
    const replicateResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${replicateApiKey}`,
      },
      body: JSON.stringify({
        version: "b72a26c2fb5dea4e54958c6847c85d815b7c6115c94c4894f356d1f9c6c2c5ad",
        input: {
          prompt: script,
          video_length: 14, // Number of frames as a number, not a string
          fps: 8,
          width: 768,
          height: 432,
          num_inference_steps: 50, // Added for better quality
          guidance_scale: 17.5, // Added for better adherence to prompt
        },
      }),
    });

    if (!replicateResponse.ok) {
      const error = await replicateResponse.json();
      console.error('Replicate API Error:', error);
      throw new Error(`Replicate API error: ${error.detail || 'Unknown error'}`);
    }

    const prediction = await replicateResponse.json();
    console.log('Prediction started:', prediction);

    // Poll for the result
    let videoUrl = null;
    let attempts = 0;
    const maxAttempts = 120; // Increased to 2 minutes for longer generations
    const pollInterval = 2000; // Poll every 2 seconds

    while (!videoUrl && attempts < maxAttempts) {
      console.log(`Polling attempt ${attempts + 1}/${maxAttempts}`);
      
      const statusResponse = await fetch(prediction.urls.get, {
        headers: {
          Authorization: `Token ${replicateApiKey}`,
        },
      });
      
      if (!statusResponse.ok) {
        const error = await statusResponse.json();
        console.error('Status check error:', error);
        throw new Error('Failed to check generation status');
      }

      const result = await statusResponse.json();
      console.log('Prediction status:', result.status);

      if (result.status === 'succeeded') {
        videoUrl = result.output;
        console.log('Video generation succeeded:', videoUrl);
        break;
      } else if (result.status === 'failed') {
        console.error('Generation failed:', result.error);
        throw new Error(`Video generation failed: ${result.error || 'Unknown error'}`);
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      attempts++;
    }

    if (!videoUrl) {
      throw new Error('Video generation timed out');
    }

    // Download the generated video
    console.log('Downloading generated video...');
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      throw new Error('Failed to download generated video');
    }

    const videoBlob = await videoResponse.blob();
    const timestamp = new Date().getTime();
    const fileName = `preview-${timestamp}.mp4`;

    // Upload to Supabase Storage
    console.log('Uploading to Supabase Storage...');
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