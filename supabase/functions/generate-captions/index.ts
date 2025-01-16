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
      console.error('ASSEMBLY_AI_API_KEY is not set')
      throw new Error('ASSEMBLY_AI_API_KEY is not set')
    }

    const { audioUrl } = await req.json()
    if (!audioUrl) {
      console.error('No audio URL provided')
      throw new Error('No audio URL provided')
    }

    console.log('Starting caption generation for audio URL:', audioUrl)

    // First, validate the audio URL is accessible
    try {
      const audioCheck = await fetch(audioUrl)
      if (!audioCheck.ok) {
        console.error('Audio URL is not accessible:', audioUrl)
        throw new Error('Audio URL is not accessible')
      }
    } catch (error) {
      console.error('Error checking audio URL:', error)
      throw new Error(`Audio URL validation failed: ${error.message}`)
    }

    // Submit transcription request to AssemblyAI
    console.log('Submitting transcription request to AssemblyAI')
    const uploadResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'authorization': assemblyKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        word_boost: ["reddit", "upvote", "downvote", "comment", "post"],
        word_timestamps: true,
        format_text: true,
        punctuate: true,
        dual_channel: false,
        webhook_url: null,
        boost_param: "high",
        auto_highlights: true
      })
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error('AssemblyAI transcription request failed:', errorText)
      throw new Error(`Failed to submit transcription: ${errorText}`)
    }

    const transcript = await uploadResponse.json()
    console.log('Transcription submitted successfully. ID:', transcript.id)

    // Poll for completion
    const maxAttempts = 60
    let attempts = 0
    let result = null

    while (attempts < maxAttempts) {
      console.log(`Polling attempt ${attempts + 1}/${maxAttempts}`)
      
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
        console.log('Transcription completed successfully')
        break
      }
      
      if (result.status === 'error') {
        console.error('Transcription failed:', result.error)
        throw new Error(`Transcription failed: ${result.error}`)
      }

      console.log(`Status: ${result.status}. Waiting before next poll...`)
      attempts++
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    if (!result || result.status !== 'completed') {
      console.error('Transcription timed out after maximum attempts')
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

    console.log('Successfully generated captions')
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
    console.error('Error in generate-captions function:', error)
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