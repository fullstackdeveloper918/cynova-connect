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
    
    // Using a different RapidAPI endpoint for better reliability
    const detailsResponse = await fetch(`https://youtube-video-and-shorts-downloader.p.rapidapi.com/get_video?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'youtube-video-and-shorts-downloader.p.rapidapi.com'
      }
    });

    if (!detailsResponse.ok) {
      console.error('API Error Response:', await detailsResponse.text());
      throw new Error('Failed to fetch video details from API');
    }

    const data = await detailsResponse.json();
    console.log('API Response:', JSON.stringify(data, null, 2));

    if (!data || !data.video) {
      throw new Error('Invalid API response format');
    }

    // Extract the video formats
    const formats = data.video.formats || [];
    if (!formats.length) {
      throw new Error('No video formats available');
    }

    // Find the best quality format (preferably 720p)
    const format = formats.find((f: any) => 
      f.quality === '720p' && f.extension === 'mp4'
    ) || formats.find((f: any) => f.extension === 'mp4') || formats[0];

    if (!format || !format.url) {
      throw new Error('Could not find a suitable video format');
    }

    return new Response(
      JSON.stringify({
        videoUrl: format.url,
        title: data.video.title || 'YouTube Video',
        description: data.video.description || '',
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