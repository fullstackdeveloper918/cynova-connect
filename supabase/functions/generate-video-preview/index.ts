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

    // Create a unique filename for this preview
    const timestamp = new Date().getTime();
    const previewFileName = `preview-${timestamp}.mp4`;
    
    // Initialize Supabase client with service role key to access storage
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // TODO: Here you would implement the actual video generation logic
    // For now, we'll create a text-based video using HTML5 canvas
    const canvas = new OffscreenCanvas(1280, 720);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Set background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 1280, 720);

    // Add text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(script.substring(0, 50) + '...', 640, 360);

    // Convert canvas to blob
    const blob = await canvas.convertToBlob({
      type: 'image/png'
    });

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('exports')
      .upload(previewFileName, blob, {
        contentType: 'video/mp4',
        upsert: true
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from('exports')
      .getPublicUrl(previewFileName);

    console.log('Generated preview URL:', publicUrl);

    return new Response(
      JSON.stringify({ 
        previewUrl: publicUrl,
        message: "Preview generated successfully" 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
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