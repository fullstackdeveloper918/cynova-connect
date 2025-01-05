import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { generateAudioWithRetry } from "./audioService.ts";
import { generateConversation } from "./openAIService.ts";
import { ConversationRequest, Message, MessageWithAudio } from "./types.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, topic, duration, voiceId } = await req.json() as ConversationRequest;
    console.log('Received request:', { prompt, topic, duration, voiceId });

    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    const elevenLabsKey = Deno.env.get('ELEVEN_LABS_API_KEY');

    if (!openAiKey || !elevenLabsKey) {
      throw new Error('Missing required API keys');
    }

    // Calculate approximate number of messages based on duration
    const targetMessageCount = Math.max(Math.floor(duration / 2.5), 5);
    console.log(`Target message count: ${targetMessageCount}`);

    // Generate conversation
    const data = await generateConversation(openAiKey, topic, prompt, targetMessageCount, duration);
    
    let messages: Message[];
    try {
      const content = JSON.parse(data.choices[0].message.content);
      messages = content.messages || content;
      
      if (!Array.isArray(messages)) {
        throw new Error('Response is not an array');
      }
      
      messages.forEach((msg, index) => {
        if (!msg.content || typeof msg.isUser !== 'boolean' || !msg.timestamp) {
          throw new Error(`Invalid message format at index ${index}`);
        }
      });
      
      console.log(`Successfully parsed ${messages.length} messages`);
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
      console.error('Raw response:', data.choices[0].message.content);
      throw new Error(`Invalid conversation format: ${error.message}`);
    }

    // Generate audio for messages
    console.log('Generating audio for messages...');
    const messagesWithAudio: MessageWithAudio[] = await Promise.all(
      messages.map(async (message: Message, index: number) => {
        try {
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

    console.log('Successfully generated all audio content');
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