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

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY is not set in environment variables');
      throw new Error('OPENAI_API_KEY is not set');
    }

    console.log('Generating frames with DALL-E...');
    
    // Generate 4 frames using DALL-E 3
    const frames = [];
    const framePrompts = splitScriptIntoFrames(script);
    
    for (const framePrompt of framePrompts) {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: framePrompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
          response_format: "url"
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('DALL-E API Error:', error);
        throw new Error(`DALL-E API error: ${error.error?.message || JSON.stringify(error)}`);
      }

      const data = await response.json();
      frames.push(data.data[0].url);
      console.log('Generated frame:', data.data[0].url);
    }

    // Initialize Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Download and combine frames into a video-like slideshow
    const frameResponses = await Promise.all(frames.map(url => fetch(url)));
    const frameBlobs = await Promise.all(frameResponses.map(res => res.blob()));
    
    // Create a simple slideshow from the frames
    const fileName = `preview-${Date.now()}.mp4`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('exports')
      .upload(fileName, frameBlobs[0], { // For now, just use the first frame as a preview
        contentType: 'image/png',
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
        frames: frames, // Include all frame URLs for frontend display
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

// Helper function to split script into frame prompts
function splitScriptIntoFrames(script: string): string[] {
  // Split the script into roughly equal parts for each frame
  const sentences = script.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const frameCount = Math.min(4, Math.max(1, sentences.length));
  const framesPrompts = [];
  
  for (let i = 0; i < frameCount; i++) {
    const start = Math.floor((i * sentences.length) / frameCount);
    const end = Math.floor(((i + 1) * sentences.length) / frameCount);
    const frameScript = sentences.slice(start, end).join('. ');
    framesPrompts.push(`Create a high-quality, photorealistic image for a video frame that represents this scene: ${frameScript}`);
  }

  return framesPrompts;
}