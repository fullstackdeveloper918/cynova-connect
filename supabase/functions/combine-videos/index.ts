import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get form data
    const formData = await req.formData();
    const userVideo = formData.get('userVideo') as File;
    const backgroundId = formData.get('backgroundId') as string;
    const captions = formData.get('captions') as string;

    if (!userVideo || !backgroundId) {
      throw new Error('Missing required files');
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Upload user video to temporary storage
    const userVideoPath = `temp/${crypto.randomUUID()}.mp4`;
    const { error: uploadError } = await supabase.storage
      .from('exports')
      .upload(userVideoPath, userVideo);

    if (uploadError) throw uploadError;

    // Get the background video URL
    const backgroundPath = `stock/${backgroundId}-gameplay.mp4`;

    // Initialize Replicate for video processing
    const replicateResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${Deno.env.get('REPLICATE_API_KEY')}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "435061a1b5a4c1e26740464bf786efdfa9cb3a3ac488595a2de23e143fdb0117",
        input: {
          userVideo: userVideoPath,
          backgroundVideo: backgroundPath,
          captions: captions,
        },
      }),
    });

    const prediction = await replicateResponse.json();
    console.log("Replicate prediction started:", prediction);

    // Poll for completion
    const outputUrl = await pollReplicateOutput(prediction.id);
    
    if (!outputUrl) {
      throw new Error("Failed to generate combined video");
    }

    // Download the processed video and upload to Supabase
    const processedResponse = await fetch(outputUrl);
    const processedVideo = await processedResponse.blob();
    
    const finalPath = `combined/${crypto.randomUUID()}.mp4`;
    const { data: uploadData, error: finalUploadError } = await supabase.storage
      .from('exports')
      .upload(finalPath, processedVideo);

    if (finalUploadError) throw finalUploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('exports')
      .getPublicUrl(finalPath);

    // Clean up temporary files
    await supabase.storage
      .from('exports')
      .remove([userVideoPath]);

    return new Response(
      JSON.stringify({
        videoUrl: publicUrl,
        thumbnailUrl: publicUrl,
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error in combine-videos function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});

async function pollReplicateOutput(predictionId: string): Promise<string | null> {
  const maxAttempts = 30;
  const delayMs = 2000;
  
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      {
        headers: {
          "Authorization": `Token ${Deno.env.get('REPLICATE_API_KEY')}`,
        },
      }
    );
    
    const prediction = await response.json();
    
    if (prediction.status === "succeeded") {
      return prediction.output;
    } else if (prediction.status === "failed") {
      throw new Error("Video processing failed");
    }
    
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  
  throw new Error("Timeout waiting for video processing");
}