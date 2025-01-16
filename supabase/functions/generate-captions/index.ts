import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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
    const assemblyKey = Deno.env.get('ASSEMBLY_AI_API_KEY')
    if (!assemblyKey) {
      throw new Error('ASSEMBLY_AI_API_KEY is not set')
    }

    const { audioUrl } = await req.json()
    if (!audioUrl) {
      throw new Error('No audio URL provided')
    }

    console.log('Creating transcription request for audio:', audioUrl)

    // First, upload the audio file URL to AssemblyAI
    const uploadResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'authorization': assemblyKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        word_boost: ["reddit", "upvote", "downvote", "comment", "post"],
        word_timestamps: true
      }),
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error('Transcription request failed:', errorText)
      throw new Error(`Failed to submit transcription: ${errorText}`)
    }

    const transcript = await uploadResponse.json()
    console.log('Transcription submitted:', transcript.id)

    // Poll for completion
    const maxAttempts = 60
    let attempts = 0
    let result = null

    while (attempts < maxAttempts) {
      const pollingResponse = await fetch(
        `https://api.assemblyai.com/v2/transcript/${transcript.id}`,
        {
          headers: {
            'authorization': assemblyKey,
          },
        }
      )

      if (!pollingResponse.ok) {
        const errorText = await pollingResponse.text()
        console.error('Polling failed:', errorText)
        throw new Error(`Failed to poll for results: ${errorText}`)
      }

      result = await pollingResponse.json()
      
      if (result.status === 'completed') {
        console.log('Transcription completed')
        break
      }
      
      if (result.status === 'error') {
        console.error('Transcription failed:', result.error)
        throw new Error(`Transcription failed: ${result.error}`)
      }

      console.log(`Attempt ${attempts + 1}: Status is ${result.status}`)
      attempts++
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    if (!result || result.status !== 'completed') {
      throw new Error('Transcription timed out')
    }

    // Format response with word-level timestamps
    const response = {
      captions: result.words.map((word: any) => ({
        text: word.text,
        start: word.start,
        end: word.end,
      })),
      text: result.text,
      message: "Captions generated successfully"
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate captions',
        details: error.message
      }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})