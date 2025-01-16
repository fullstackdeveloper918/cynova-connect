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
    console.log('Received audio URL:', audioUrl);

    if (!audioUrl) {
      throw new Error('No audio URL provided');
    }

    const apiKey = Deno.env.get('ASSEMBLY_AI_API_KEY');
    if (!apiKey) {
      throw new Error('ASSEMBLY_AI_API_KEY is not set');
    }

    // Step 1: Submit transcription request
    console.log('Submitting transcription request to AssemblyAI...');
    const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        word_boost: ["reddit", "upvote", "downvote", "comment", "post"],
        word_timestamps: true,
        format_text: true,
        punctuate: true,
        language_code: "en"
      })
    });

    if (!transcriptResponse.ok) {
      const errorText = await transcriptResponse.text();
      console.error('AssemblyAI API error:', errorText);
      throw new Error(`Failed to submit transcription: ${errorText}`);
    }

    const transcriptData = await transcriptResponse.json();
    console.log('Transcription submitted successfully:', transcriptData);

    // Step 2: Poll for results
    const transcriptId = transcriptData.id;
    let result;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes maximum waiting time

    while (attempts < maxAttempts) {
      console.log(`Polling attempt ${attempts + 1} for transcript ${transcriptId}`);
      
      const pollResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: {
          'Authorization': apiKey,
        },
      });

      if (!pollResponse.ok) {
        const errorText = await pollResponse.text();
        console.error('Error polling transcription:', errorText);
        throw new Error(`Failed to poll transcription: ${errorText}`);
      }

      result = await pollResponse.json();
      console.log('Poll result status:', result.status);

      if (result.status === 'completed') {
        break;
      } else if (result.status === 'error') {
        throw new Error(`Transcription failed: ${result.error}`);
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds between polls
    }

    if (!result || result.status !== 'completed') {
      throw new Error('Transcription timed out');
    }

    console.log('Transcription completed successfully');

    // Return the formatted response
    return new Response(
      JSON.stringify({
        text: result.text,
        words: result.words,
        captions: result.words.map((word: any) => ({
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
        details: error.message
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