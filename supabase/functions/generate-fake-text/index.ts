import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, topic, duration, voiceId } = await req.json();
    console.log('Generating conversation:', { prompt, topic, duration, voiceId });

    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    // Generate conversation using OpenAI
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
            The conversation should last approximately ${duration} seconds when read aloud.
            Format the response as a JSON array of messages, where each message has: content (string), isUser (boolean), and timestamp (string in format "h:mm PM").
            Make the conversation flow naturally with appropriate delays between messages.`
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
      throw new Error(error.error?.message || 'Failed to generate conversation');
    }

    const data = await response.json();
    const messages = JSON.parse(data.choices[0].message.content);

    // Generate audio for each message
    const messagesWithAudio = await Promise.all(
      messages.map(async (message: any) => {
        const audioUrl = await generateAudioForMessage(message.content, voiceId);
        return { ...message, audioUrl };
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

async function generateAudioForMessage(text: string, voiceId: string) {
  const elevenLabsApiKey = Deno.env.get('ELEVEN_LABS_API_KEY');
  if (!elevenLabsApiKey) {
    throw new Error('ELEVEN_LABS_API_KEY is not set');
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error('ElevenLabs API Error:', error);
    throw new Error('Failed to generate audio');
  }

  // Convert audio to base64 for easy transmission
  const audioBuffer = await response.arrayBuffer();
  const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
  return `data:audio/mpeg;base64,${base64Audio}`;
}