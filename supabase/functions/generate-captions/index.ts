import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    console.log('Received request to transcribe:', audioUrl);

    const assemblyKey = Deno.env.get('ASSEMBLY_AI_API_KEY');
    if (!assemblyKey) {
      throw new Error('ASSEMBLY_AI_API_KEY is not set');
    }

    // First, upload the audio file to AssemblyAI
    console.log('Uploading audio to AssemblyAI...');
    const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'authorization': assemblyKey,
      },
      body: await fetch(audioUrl).then(r => r.blob())
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload audio to AssemblyAI');
    }

    const { upload_url } = await uploadResponse.json();
    console.log('Audio uploaded successfully:', upload_url);

    // Then, submit the transcription request
    console.log('Submitting transcription request...');
    const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'authorization': assemblyKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: upload_url,
        word_boost: ["reddit", "upvote", "downvote", "comment", "post"],
        word_timestamps: true,
      }),
    });

    if (!transcriptResponse.ok) {
      throw new Error('Failed to submit transcription request');
    }

    const { id: transcriptId } = await transcriptResponse.json();
    console.log('Transcription submitted, ID:', transcriptId);

    // Poll for the result
    let result;
    const maxAttempts = 60; // 5 minutes maximum
    let attempts = 0;

    while (attempts < maxAttempts) {
      console.log(`Polling attempt ${attempts + 1}/${maxAttempts}`);
      
      const pollResponse = await fetch(
        `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
        {
          headers: {
            'authorization': assemblyKey,
          },
        }
      );

      if (!pollResponse.ok) {
        throw new Error('Failed to poll transcription status');
      }

      result = await pollResponse.json();
      
      if (result.status === 'completed') {
        console.log('Transcription completed successfully');
        break;
      } else if (result.status === 'error') {
        throw new Error(`Transcription failed: ${result.error}`);
      }

      // Wait 5 seconds before polling again
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }

    if (!result || result.status !== 'completed') {
      throw new Error('Transcription timed out');
    }

    // Format the response with word-level timestamps
    const captions = result.words.map((word: any) => ({
      text: word.text,
      start: word.start,
      end: word.end,
    }));

    return new Response(
      JSON.stringify({ 
        captions,
        text: result.text,
        message: "Captions generated successfully" 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
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
          'Content-Type': 'application/json'
        }
      }
    );
  }
});