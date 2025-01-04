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
    console.log('Received request:', { script, voice });

    if (!script) {
      throw new Error('No script provided');
    }

    const replicateApiKey = Deno.env.get('REPLICATE_API_KEY');
    if (!replicateApiKey) {
      throw new Error('REPLICATE_API_KEY is not set');
    }

    console.log('Calling Replicate API to generate video...');
    
    // Call Replicate API to generate video
    const prediction = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${replicateApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "b72a26c2fb5dea4e54958c6847c85d815b7c6115c94c4894f356d1f9c6c2c5ad",
        input: {
          prompt: script,
          video_length: "14", // Replicate expects a string
          fps: "8",
          width: "768",
          height: "432",
        },
      }),
    });

    if (!prediction.ok) {
      const error = await prediction.json();
      console.error('Replicate API Error:', error);
      throw new Error(`Replicate API error: ${error.detail || 'Unknown error'}`);
    }

    const predictionData = await prediction.json();
    console.log('Prediction started:', predictionData);

    // Poll for the result
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes with 2-second intervals
    const pollInterval = 2000;

    while (attempts < maxAttempts) {
      console.log(`Polling attempt ${attempts + 1}/${maxAttempts}`);
      
      const statusResponse = await fetch(predictionData.urls.get, {
        headers: {
          "Authorization": `Token ${replicateApiKey}`,
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
        console.log('Video generation succeeded:', result.output);
        
        // Initialize Supabase client
        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Download the video
        const videoResponse = await fetch(result.output);
        if (!videoResponse.ok) {
          throw new Error('Failed to download generated video');
        }

        const videoBlob = await videoResponse.blob();
        const fileName = `preview-${Date.now()}.mp4`;

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

        // Get public URL
        const { data: { publicUrl } } = supabaseAdmin
          .storage
          .from('exports')
          .getPublicUrl(fileName);

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
      } else if (result.status === 'failed') {
        console.error('Generation failed:', result.error);
        throw new Error(`Video generation failed: ${result.error || 'Unknown error'}`);
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
      attempts++;
    }

    throw new Error('Video generation timed out');

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