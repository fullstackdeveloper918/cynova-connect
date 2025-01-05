import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function generateAudioWithRetry(
  message: string, 
  index: number, 
  elevenLabsKey: string, 
  voiceId: string, 
  retryCount = 0
): Promise<ArrayBuffer> {
  try {
    console.log(`Attempt ${retryCount + 1} to generate audio for message ${index}`);
    const audioResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsKey,
        },
        body: JSON.stringify({
          text: message,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    );

    if (!audioResponse.ok) {
      const errorText = await audioResponse.text();
      throw new Error(`ElevenLabs API error: ${errorText}`);
    }

    return await audioResponse.arrayBuffer();
  } catch (error) {
    console.error(`Error generating audio for message ${index}:`, error);
    
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying audio generation for message ${index} after ${RETRY_DELAY}ms`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return generateAudioWithRetry(message, index, elevenLabsKey, voiceId, retryCount + 1);
    }
    
    throw new Error(`Failed to generate audio after ${MAX_RETRIES} attempts: ${error.message}`);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, topic, duration, voiceId } = await req.json();
    console.log('Generating conversation:', { prompt, topic, duration, voiceId });

    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    const elevenLabsKey = Deno.env.get('ELEVEN_LABS_API_KEY');

    if (!openAiKey || !elevenLabsKey) {
      throw new Error('Missing required API keys');
    }

    // Calculate approximate number of messages based on duration
    const targetMessageCount = Math.max(Math.floor(duration / 2.5), 5);

    console.log('Calling OpenAI API...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert at creating realistic iMessage conversations. Generate a natural conversation between two people about the given topic. 
            The conversation should have approximately ${targetMessageCount} messages to fill a ${duration}-second duration when read aloud.
            
            IMPORTANT: Your response must be a valid JSON array of message objects. Each message object must have these exact properties:
            - "content": string (the message text)
            - "isUser": boolean (alternating between true and false)
            - "timestamp": string (in "h:mm PM" format)
            
            Guidelines for natural conversation:
            - Keep each message very concise (5-10 words maximum)
            - Space out timestamps naturally over the ${duration}-second duration
            - Make the conversation flow naturally with quick back-and-forth exchanges
            - Include natural reactions and short responses like "Really?", "No way!", "That's awesome!"
            - Break longer thoughts into multiple shorter messages from the same person
            
            Example of expected format:
            [
              {"content": "Hey, what's up?", "isUser": true, "timestamp": "2:30 PM"},
              {"content": "Not much, just got back from lunch", "isUser": false, "timestamp": "2:31 PM"}
            ]`
          },
          {
            role: 'user',
            content: `Create a conversation about: ${topic}. Additional context: ${prompt}`
          }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API Error:', error);
      throw new Error(error.error?.message || 'Failed to generate conversation');
    }

    const data = await response.json();
    console.log('OpenAI response:', data.choices[0].message.content);

    let messages;
    try {
      messages = JSON.parse(data.choices[0].message.content);
      if (!Array.isArray(messages)) {
        throw new Error('Response is not an array');
      }
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
      throw new Error('Invalid conversation format received from OpenAI');
    }

    // Generate audio for each message with better error handling and retries
    console.log('Generating audio for messages...');
    const messagesWithAudio = await Promise.all(
      messages.map(async (message: any, index: number) => {
        try {
          console.log(`Generating audio for message ${index}:`, message.content);
          const audioBuffer = await generateAudioWithRetry(message.content, index, elevenLabsKey, voiceId);
          const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
          
          return { 
            ...message, 
            audioUrl: `data:audio/mpeg;base64,${base64Audio}` 
          };
        } catch (error) {
          console.error(`Error in audio generation for message ${index}:`, error);
          throw new Error(`Failed to generate audio for message ${index}: ${error.message}`);
        }
      })
    );

    return new Response(
      JSON.stringify({ 
        messages: messagesWithAudio,
        message: "Conversation generated successfully" 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error in generate-fake-text function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate conversation',
        details: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});