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

    // Generate audio for each message with better error handling
    console.log('Generating audio for messages...');
    const messagesWithAudio = await Promise.all(
      messages.map(async (message: any, index: number) => {
        try {
          console.log(`Generating audio for message ${index}:`, message.content);
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
            throw new Error(`Failed to generate audio for message ${index}`);
          }

          const audioBuffer = await audioResponse.arrayBuffer();
          const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
          
          return { 
            ...message, 
            audioUrl: `data:audio/mpeg;base64,${base64Audio}` 
          };
        } catch (error) {
          console.error(`Error generating audio for message ${index}:`, error);
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