import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Utility function for exponential backoff
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Utility function to validate URL
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audioUrl } = await req.json();
    console.log('Received request with audio URL:', audioUrl);

    if (!audioUrl) {
      throw new Error('No audio URL provided');
    }

    if (!isValidUrl(audioUrl)) {
      throw new Error('Invalid audio URL format');
    }

    const apiKey = Deno.env.get('ASSEMBLY_AI_API_KEY');
    if (!apiKey) {
      throw new Error('ASSEMBLY_AI_API_KEY is not set');
    }

    // Step 1: Submit transcription request with retry logic
    console.log('Submitting transcription request to AssemblyAI...');
    
    const headers = {
      'Authorization': apiKey,
      'Content-Type': 'application/json',
    };

    const requestBody = {
      audio_url: audioUrl,
      word_boost: ["reddit", "upvote", "downvote", "comment", "post"],
      word_timestamps: true,
      format_text: true,
      punctuate: true,
      language_code: "en"
    };

    console.log('Request configuration:', {
      endpoint: 'https://api.assemblyai.com/v2/transcript',
      headers: { ...headers, Authorization: '***' }, // Hide actual API key
      body: requestBody
    });

    let response;
    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries) {
      try {
        response = await fetch('https://api.assemblyai.com/v2/transcript', {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody),
        });

        if (response.ok) break;

        console.log(`Attempt ${retries + 1} failed with status ${response.status}`);
        const responseText = await response.text();
        console.log('Response body:', responseText);

        retries++;
        if (retries < maxRetries) {
          const backoffMs = Math.pow(2, retries) * 1000;
          console.log(`Waiting ${backoffMs}ms before retry...`);
          await wait(backoffMs);
        }
      } catch (error) {
        console.error(`Network error on attempt ${retries + 1}:`, error);
        retries++;
        if (retries < maxRetries) {
          const backoffMs = Math.pow(2, retries) * 1000;
          await wait(backoffMs);
        }
      }
    }

    if (!response?.ok) {
      const errorText = await response?.text();
      console.error('Final API error response:', errorText);
      throw new Error(`Failed to submit transcription: ${errorText}`);
    }

    const transcriptData = await response.json();
    console.log('Transcription submitted successfully, ID:', transcriptData.id);

    // Step 2: Poll for results with improved error handling
    const transcriptId = transcriptData.id;
    let result;
    let attempts = 0;
    const maxAttempts = 60; // 3 minutes maximum waiting time
    const pollInterval = 3000; // 3 seconds between polls

    while (attempts < maxAttempts) {
      console.log(`Polling attempt ${attempts + 1} for transcript ${transcriptId}`);
      
      try {
        const pollResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
          headers: {
            'Authorization': apiKey,
          },
        });

        if (!pollResponse.ok) {
          const errorText = await pollResponse.text();
          console.error('Polling error response:', errorText);
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
        await wait(pollInterval);
      } catch (error) {
        console.error('Polling attempt failed:', error);
        attempts++;
        if (attempts < maxAttempts) {
          await wait(pollInterval);
        }
      }
    }

    if (!result || result.status !== 'completed') {
      throw new Error('Transcription timed out or failed');
    }

    console.log('Transcription completed successfully');

    // Return the formatted response with CORS headers
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