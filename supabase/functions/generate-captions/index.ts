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

    console.log('Submitting transcription request to AssemblyAI...');

    // First, submit the audio file for transcription
    const transcriptionResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
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
        dual_channel: false,
        auto_highlights: true
      })
    });

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text();
      console.error('AssemblyAI API error:', errorText);
      throw new Error(`Failed to submit transcription: ${errorText}`);
    }

    const transcriptionData = await transcriptionResponse.json();
    console.log('Transcription submitted successfully:', transcriptionData);

    // Poll for the transcription result
    const transcriptId = transcriptionData.id;
    let result;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes maximum waiting time

    while (attempts < maxAttempts) {
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

    return new Response(
      JSON.stringify({
        text: result.text,
        words: result.words,
        captions: result
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