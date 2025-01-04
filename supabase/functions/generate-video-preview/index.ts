import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase_supabase-js@2';
import { decode } from "https://deno.land/x/djwt@v2.8/mod.ts";

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
    
    // Get the user's session from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Extract user ID from JWT token
    const token = authHeader.replace('Bearer ', '');
    const [_header, payload] = decode(token);
    const userId = payload.sub;

    if (!userId) {
      throw new Error('Invalid user ID');
    }

    console.log('Generating preview for user:', userId);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create a temporary project to store the preview
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        title: 'Preview: ' + script.substring(0, 50) + '...',
        description: script,
        type: 'chatgpt_video',
        user_id: userId,
        status: 'preview',
        video_url: `/preview/${Date.now()}.mp4` // Generate a unique URL
      })
      .select()
      .single();

    if (projectError) {
      console.error('Error creating preview project:', projectError);
      throw projectError;
    }

    console.log('Created preview project:', project);

    // For now, we'll return the video_url from the project
    // In a real implementation, this would be where you generate the actual video
    return new Response(
      JSON.stringify({ 
        previewUrl: project.video_url,
        projectId: project.id
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