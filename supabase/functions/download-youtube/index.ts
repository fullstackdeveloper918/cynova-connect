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
      throw new Error('Invalid YouTube URL. Please provide a valid YouTube video URL');
    }

    console.log('Processing video ID:', videoId);

    // Using YouTube v3 API endpoint
    const rapidApiUrl = 'https://youtube-v31.p.rapidapi.com/videos';
    const searchParams = new URLSearchParams({
      part: 'contentDetails,snippet,statistics',
      id: videoId
    });
    
    console.log('Fetching video details from:', `${rapidApiUrl}?${searchParams}`);
    
    const rapidApiResponse = await fetch(`${rapidApiUrl}?${searchParams}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'youtube-v31.p.rapidapi.com'
      }
    });

    if (!rapidApiResponse.ok) {
      const error = await rapidApiResponse.text();
      console.error('RapidAPI error:', error);
      throw new Error(`Failed to fetch video information: ${error}`);
    }

    const data = await rapidApiResponse.json();
    console.log('Video details response:', data);

    if (!data.items || data.items.length === 0) {
      throw new Error('Video not found');
    }

    const videoDetails = data.items[0];
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    return new Response(
      JSON.stringify({
        videoUrl: videoUrl,
        title: videoDetails.snippet.title,
        description: videoDetails.snippet.description,
        thumbnail: videoDetails.snippet.thumbnails.high.url
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