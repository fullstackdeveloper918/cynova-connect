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
    console.log('Calling RapidAPI endpoint:', rapidApiUrl)
    
    const rapidApiResponse = await fetch(`${rapidApiUrl}?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'tiktok-download-without-watermark.p.rapidapi.com'
      }
    })

    if (!rapidApiResponse.ok) {
      const errorText = await rapidApiResponse.text()
      console.error('RapidAPI error response:', errorText)
      throw new Error(`Failed to fetch video information: ${errorText}`)
    }

    const data = await rapidApiResponse.json()
    console.log('RapidAPI response data:', JSON.stringify(data, null, 2))

    // Check for different possible response structures
    let videoUrl = null
    let title = 'TikTok Video'

    if (data.data) {
      // Handle response format where video URL is in data.data
      videoUrl = data.data.play || data.data.wmplay || data.data.hdplay
      title = data.data.title || title
    } else if (data.video && data.video.url_list) {
      // Handle response format with url_list
      videoUrl = data.video.url_list[0]
      title = data.title || title
    } else if (typeof data === 'object') {
      // Try to find any URL-like string in the response
      const findVideoUrl = (obj: any): string | null => {
        for (const key in obj) {
          if (typeof obj[key] === 'string' && obj[key].startsWith('http') && obj[key].includes('.mp4')) {
            return obj[key]
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            const found = findVideoUrl(obj[key])
            if (found) return found
          }
        }
        return null
      }
      videoUrl = findVideoUrl(data)
    }

    if (!videoUrl) {
      console.error('No video URL found in response. Full response:', JSON.stringify(data, null, 2))
      throw new Error('Could not extract video URL from the response')
    }

    console.log('Successfully extracted video URL:', videoUrl)

    return new Response(
      JSON.stringify({
        success: true,
        videoUrl,
        title
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