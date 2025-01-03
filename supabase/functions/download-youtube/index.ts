import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    console.log('Received request to download YouTube video:', url)

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const rapidApiKey = Deno.env.get('RAPID_API_KEY')
    if (!rapidApiKey) {
      console.error('RAPID_API_KEY not found in environment variables')
      return new Response(
        JSON.stringify({ error: 'API configuration error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const rapidApiUrl = 'https://youtube-video-download-info.p.rapidapi.com/dl';
    console.log('Calling RapidAPI endpoint:', rapidApiUrl)
    
    const rapidApiResponse = await fetch(`${rapidApiUrl}?id=${extractVideoId(url)}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'youtube-video-download-info.p.rapidapi.com'
      }
    });

    if (!rapidApiResponse.ok) {
      const errorText = await rapidApiResponse.text()
      console.error('RapidAPI error response:', errorText)
      throw new Error(`Failed to fetch video information: ${errorText}`)
    }

    const data = await rapidApiResponse.json()
    console.log('RapidAPI response:', JSON.stringify(data, null, 2))

    if (!data.link || !data.title) {
      throw new Error('Invalid response format from API')
    }

    return new Response(
      JSON.stringify({
        success: true,
        videoUrl: data.link,
        title: data.title
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in download-youtube function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

// Helper function to extract video ID from YouTube URL
function extractVideoId(url: string): string {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : url;
}