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
    const { audioUrl } = await req.json()
    console.log('Received request to transcribe:', audioUrl)

    const assemblyKey = Deno.env.get('ASSEMBLY_AI_API_KEY')
    if (!assemblyKey) {
      throw new Error('ASSEMBLY_AI_API_KEY is not set')
    }

    // Create a transcription request
    console.log('Creating transcription request...')
    const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'authorization': assemblyKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        word_boost: ["reddit", "upvote", "downvote", "comment", "post"],
        word_timestamps: true,
        auto_chapters: true,
        entity_detection: true,
        auto_highlights: true,
        sentiment_analysis: true,
        iab_categories: true,
        content_safety: true,
      }),
    })

    if (!transcriptResponse.ok) {
      const errorText = await transcriptResponse.text()
      console.error('Transcription request failed:', errorText)
      throw new Error(`Failed to submit transcription: ${errorText}`)
    }

    const { id: transcriptId } = await transcriptResponse.json()
    console.log('Transcription submitted, ID:', transcriptId)

    // Poll for results
    let result
    const maxAttempts = 60
    let attempts = 0

    while (attempts < maxAttempts) {
      console.log(`Polling attempt ${attempts + 1}/${maxAttempts}`)
      
      const pollResponse = await fetch(
        `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
        {
          headers: {
            'authorization': assemblyKey,
          },
        }
      )

      if (!pollResponse.ok) {
        const errorText = await pollResponse.text()
        console.error('Polling failed:', errorText)
        throw new Error(`Failed to poll transcription: ${errorText}`)
      }

      result = await pollResponse.json()
      console.log('Poll result status:', result.status)
      
      if (result.status === 'completed') {
        console.log('Transcription completed successfully')
        break
      } else if (result.status === 'error') {
        console.error('Transcription failed:', result)
        throw new Error(`Transcription failed: ${result.error}`)
      }

      await new Promise(resolve => setTimeout(resolve, 1000))
      attempts++
    }

    if (!result || result.status !== 'completed') {
      throw new Error('Transcription timed out')
    }

    // Format response with word-level timestamps and additional data
    const response = {
      captions: result.words.map((word: any) => ({
        text: word.text,
        start: word.start,
        end: word.end,
      })),
      text: result.text,
      chapters: result.chapters,
      highlights: result.auto_highlights_result,
      sentiment: result.sentiment_analysis_results,
      topics: result.iab_categories_result,
      safety: result.content_safety_labels,
      message: "Captions generated successfully"
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
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
          'Content-Type': 'application/json'
        }
      }
    )
  }
})