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
    console.log('Received request to download TikTok video:', url)

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

    const rapidApiUrl = 'https://tiktok-download-without-watermark.p.rapidapi.com/analysis'
    const rapidApiResponse = await fetch(`${rapidApiUrl}?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'tiktok-download-without-watermark.p.rapidapi.com'
      }
    })

    if (!rapidApiResponse.ok) {
      console.error('RapidAPI error:', await rapidApiResponse.text())
      throw new Error('Failed to fetch video information')
    }

    const data = await rapidApiResponse.json()
    console.log('RapidAPI response:', data)

    if (!data.video || !data.video.url_list || data.video.url_list.length === 0) {
      throw new Error('No video URL found in response')
    }

    return new Response(
      JSON.stringify({
        success: true,
        videoUrl: data.video.url_list[0],
        title: data.title || 'TikTok Video'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in download-tiktok function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})