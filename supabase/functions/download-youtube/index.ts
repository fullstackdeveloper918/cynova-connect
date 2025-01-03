import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function extractVideoId(url: string) {
  try {
    // First, try to validate if it's a valid URL
    new URL(url);
    
    let videoId = '';
    
    if (url.includes('youtu.be/')) {
      // Handle youtu.be format
      videoId = url.split('youtu.be/')[1];
      if (videoId) {
        videoId = videoId.split('?')[0];
      }
    } else if (url.includes('youtube.com/watch')) {
      // Handle youtube.com format
      const urlObj = new URL(url);
      videoId = urlObj.searchParams.get('v') || '';
    }

    console.log('Extracted video ID:', videoId);
    
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
    console.log('Received request with URL:', url);

    if (!url) {
      throw new Error('URL is required');
    }

    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      throw new Error('Invalid URL: Not a YouTube URL');
    }

    const videoId = extractVideoId(url);
    console.log('Successfully extracted video ID:', videoId);

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
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({
        error: error.message
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
})