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

    // Log request configuration
    console.log('Making request to AssemblyAI with configuration:', {
      url: 'https://api.assemblyai.com/v2/transcript',
      method: 'POST',
      headers: {
        'Authorization': '***' // Hide actual key in logs
      },
      body: { audio_url: audioUrl }
    });

    // Step 1: Submit transcription request
    const response = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        word_timestamps: true
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AssemblyAI API error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`AssemblyAI API error: ${response.status} ${errorText}`);
    }

    const transcriptData = await response.json();
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