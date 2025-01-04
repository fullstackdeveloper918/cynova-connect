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
    const { script, voice, previewUrl, userId, title, description } = await req.json();
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Creating export record for user:', userId);
    
    // Create an export record
    const { data: exportData, error: exportError } = await supabase
      .from('exports')
      .insert({
        user_id: userId,
        title: title,
        description: description,
        file_url: previewUrl,
        file_type: 'video/mp4',
        status: 'completed',
        file_size: 0, // You might want to calculate this
        thumbnail_url: null // You might want to generate this
      })
      .select()
      .single();

    if (exportError) {
      console.error('Error creating export record:', exportError);
      throw exportError;
    }

    console.log('Created export record:', exportData);

    return new Response(
      JSON.stringify({ 
        exportUrl: previewUrl,
        exportData,
        message: "Video exported successfully" 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in export-video function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to export video',
        details: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});