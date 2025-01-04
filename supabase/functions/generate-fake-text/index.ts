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
    const { prompt, topic } = await req.json();
    
    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    console.log('Generating conversation for topic:', topic);
    console.log('With additional context:', prompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI that generates realistic iMessage conversations. Generate a conversation about the given topic.
            Format your response as a JSON array of message objects, each with these exact properties:
            - content: the message text
            - sender: the name of the sender
            - timestamp: the time in "h:mm A" format
            - isUser: boolean, alternating between true and false
            
            Example format:
            [
              {"content": "Hey, what's up?", "sender": "User", "timestamp": "2:30 PM", "isUser": true},
              {"content": "Not much, just working on that project", "sender": "Friend", "timestamp": "2:31 PM", "isUser": false}
            ]
            
            Keep messages natural and conversational. Include 4-6 messages total.`
          },
          {
            role: 'user',
            content: `Generate a text conversation about: ${topic}. Additional context: ${prompt}`
          }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    console.log('OpenAI Response:', data);

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate conversation');
    }

    let messages;
    try {
      // Try to parse the response as JSON
      const content = data.choices[0].message.content;
      messages = JSON.parse(content.trim());
      
      // Validate the message format
      if (!Array.isArray(messages) || !messages.every(msg => 
        typeof msg.content === 'string' &&
        typeof msg.sender === 'string' &&
        typeof msg.timestamp === 'string' &&
        typeof msg.isUser === 'boolean'
      )) {
        throw new Error('Invalid message format');
      }
    } catch (e) {
      console.error('Error parsing messages:', e);
      throw new Error('Failed to parse conversation format');
    }

    return new Response(
      JSON.stringify({ messages }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-fake-text function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});