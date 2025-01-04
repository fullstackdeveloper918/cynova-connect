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
    const elevenLabsKey = Deno.env.get('ELEVEN_LABS_API_KEY');

    if (!openAiKey || !elevenLabsKey) {
      throw new Error('Missing required API keys');
    }

    // Generate conversation using OpenAI
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
      console.error('OpenAI API Error:', error);
      throw new Error(error.error?.message || 'Failed to generate conversation');
    }

    const data = await response.json();
    const messages = JSON.parse(data.choices[0].message.content);

    // Generate audio for each message
    console.log('Generating audio for messages...');
    const messagesWithAudio = await Promise.all(
      messages.map(async (message: any) => {
        try {
          console.log('Generating audio for message:', message.content);
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
                text: message.content,
                model_id: "eleven_monolingual_v1",
                voice_settings: {
                  stability: 0.5,
                  similarity_boost: 0.5,
                },
              }),
            }
          );

          if (!audioResponse.ok) {
            const errorData = await audioResponse.json();
            console.error('ElevenLabs API Error:', errorData);
            throw new Error('Failed to generate audio');
          }

          const audioBuffer = await audioResponse.arrayBuffer();
          const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
          return { 
            ...message, 
            audioUrl: `data:audio/mpeg;base64,${base64Audio}` 
          };
        } catch (error) {
          console.error('Error generating audio for message:', error);
          // Return message without audio if generation fails
          return message;
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