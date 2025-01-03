import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function extractVideoId(url: string) {
  try {
    const videoId = url.includes('youtu.be/') 
      ? url.split('youtu.be/')[1]?.split('?')[0]
      : url.split('v=')[1]?.split('&')[0];

    if (!videoId || videoId.length !== 11) {
      throw new Error(`Invalid video ID: ${videoId}`);
    }

    return videoId;
  } catch (error) {
    console.error('Error extracting video ID:', error);
    throw new Error(`Failed to extract video ID: ${error.message}`);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rapidApiKey = Deno.env.get('RAPID_API_KEY');
    if (!rapidApiKey) {
      throw new Error('RAPID_API_KEY is not set');
    }

    const { url } = await req.json();
    console.log('Processing YouTube URL:', url);

    if (!url) {
      throw new Error('URL is required');
    }

    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      throw new Error('Invalid URL: Not a YouTube URL');
    }

    const videoId = extractVideoId(url);
    console.log('Extracted video ID:', videoId);

    // Using y2mate API endpoint which is more reliable
    const detailsResponse = await fetch(`https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'youtube-mp36.p.rapidapi.com'
      }
    });

    if (!detailsResponse.ok) {
      console.error('API Error Response:', await detailsResponse.text());
      throw new Error('Failed to fetch video details from API');
    }

    const data = await detailsResponse.json();
    console.log('API Response:', JSON.stringify(data, null, 2));

    if (!data || data.status === 'fail') {
      throw new Error('Failed to process video');
    }

    // Return the processed video information
    return new Response(
      JSON.stringify({
        videoUrl: data.link,
        title: data.title || 'YouTube Video',
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'An unexpected error occurred'
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});