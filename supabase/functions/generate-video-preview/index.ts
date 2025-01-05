import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { script, voice, duration } = await req.json()
    console.log('Received request with script:', script)

    // First, generate background image using Stability AI
    console.log('Generating background image with Stability AI...')
    const imageResponse = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('STABILITY_API_KEY')}`,
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: script.slice(0, 500), // Limit prompt length
            weight: 1
          }
        ],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 30,
      }),
    })

    if (!imageResponse.ok) {
      throw new Error(`Stability AI API error: ${await imageResponse.text()}`)
    }

    const imageData = await imageResponse.json()
    const base64Image = imageData.artifacts[0].base64

    // Generate video with Replicate using the generated image
    console.log('Generating video with Replicate...')
    const videoResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${Deno.env.get('REPLICATE_API_KEY')}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "9ca13f619b96a3413ab1e03f142c2c67cc980e8590afb44a1c0c5a9bdfa04593",
        input: {
          prompt: script.slice(0, 500),
          image: `data:image/png;base64,${base64Image}`,
          num_frames: 25,
          width: 1024,
          height: 576,
          fps: 6,
          num_inference_steps: 25,
          motion_bucket_id: 127,
          guidance_scale: 12.5
        },
      }),
    })

    if (!videoResponse.ok) {
      const error = await videoResponse.json()
      throw new Error(`Replicate API error: ${JSON.stringify(error)}`)
    }

    const prediction = await videoResponse.json()
    console.log('Video generation started:', prediction)

    // Generate audio with ElevenLabs
    console.log('Generating audio with ElevenLabs...')
    const audioResponse = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voice, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': Deno.env.get('ELEVEN_LABS_API_KEY') || '',
      },
      body: JSON.stringify({
        text: script,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    })

    if (!audioResponse.ok) {
      throw new Error(`ElevenLabs API error: ${await audioResponse.text()}`)
    }

    const audioBlob = await audioResponse.blob()
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(await audioBlob.arrayBuffer())))

    return new Response(
      JSON.stringify({
        previewUrl: {
          videoUrl: prediction.urls?.get,
          audioUrl: `data:audio/mpeg;base64,${audioBase64}`
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})