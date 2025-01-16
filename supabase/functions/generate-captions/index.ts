import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audioUrl } = await req.json();
    console.log('Request received with audio URL:', audioUrl);

    if (!audioUrl) {
      throw new Error('No audio URL provided');
    }

    const apiKey = Deno.env.get('ASSEMBLY_AI_API_KEY');
    if (!apiKey) {
      throw new Error('ASSEMBLY_AI_API_KEY is not set');
    }

    // Step 1: Submit transcription request with proper schema
    console.log('Submitting transcription request to AssemblyAI');
    const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        word_boost: [""],
        boost_param: "high",
        language_code: "en",
        punctuate: true,
        format_text: true,
        dual_channel: false,
        webhook_url: null,
        auto_chapters: false,
        entity_detection: false,
        speakers_expected: 1,
        word_timestamps: true
      }),
    });

    if (!transcriptResponse.ok) {
      const errorText = await transcriptResponse.text();
      console.error('AssemblyAI API error response:', {
        status: transcriptResponse.status,
        statusText: transcriptResponse.statusText,
        body: errorText
      });
      throw new Error(`Failed to submit transcription: ${errorText}`);
    }

    const transcriptData = await transcriptResponse.json();
    console.log('Transcription submitted successfully:', transcriptData);

    // Step 2: Poll for results
    const transcriptId = transcriptData.id;
    let result;
    let attempts = 0;
    const maxAttempts = 30; // 3 minutes maximum with 6-second intervals
    
    while (attempts < maxAttempts) {
      console.log(`Polling attempt ${attempts + 1} for transcript ${transcriptId}`);
      
      const pollResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: {
          'Authorization': apiKey,
        },
      });

      if (!pollResponse.ok) {
        const errorText = await pollResponse.text();
        console.error('Polling error:', {
          status: pollResponse.status,
          statusText: pollResponse.statusText,
          body: errorText
        });
        throw new Error(`Failed to poll transcription: ${errorText}`);
      }

      result = await pollResponse.json();
      console.log('Poll result status:', result.status);

      if (result.status === 'completed') {
        console.log('Transcription completed successfully');
        break;
      } else if (result.status === 'error') {
        console.error('Transcription failed:', result.error);
        throw new Error(`Transcription failed: ${result.error}`);
      }

      attempts++;
      // Wait 6 seconds between polling attempts
      await new Promise(resolve => setTimeout(resolve, 6000));
    }

    if (!result || result.status !== 'completed') {
      throw new Error('Transcription timed out or failed');
    }

    // Return the formatted response
    return new Response(
      JSON.stringify({
        text: result.text,
        words: result.words,
        captions: result.words?.map((word: any) => ({
          text: word.text,
          start: word.start,
          end: word.end
        }))
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error in generate-captions function:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Failed to generate captions',
        details: error.message,
        timestamp: new Date().toISOString()
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
});