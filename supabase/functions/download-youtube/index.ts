import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function extractVideoId(url: string) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
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
    if (!url) {
      throw new Error('URL is required');
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      throw new Error(
        'Invalid YouTube URL. Please provide a valid YouTube video URL'
      );
    }

    // Using a different RapidAPI endpoint for YouTube downloads
    const rapidApiUrl = 'https://youtube-mp36.p.rapidapi.com/dl';
    console.log('Calling RapidAPI endpoint:', rapidApiUrl);
    
    const rapidApiResponse = await fetch(`${rapidApiUrl}?id=${videoId}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'youtube-mp36.p.rapidapi.com'
      }
    });

    if (!rapidApiResponse.ok) {
      const error = await rapidApiResponse.text();
      console.error('RapidAPI error:', error);
      throw new Error(`Failed to fetch video information: ${error}`);
    }

    const data = await rapidApiResponse.json();
    console.log('RapidAPI response:', data);

    return new Response(
      JSON.stringify({
        videoUrl: data.link,
        title: data.title
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({
        error: error.message
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
})