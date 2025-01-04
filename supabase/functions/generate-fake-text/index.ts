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
            Return the response as an array of message objects, each with: content, sender, timestamp, and isUser (boolean).
            Keep messages short and natural, like real text messages. Include 4-6 messages in total.`
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

    // Parse the response and format messages
    const content = data.choices[0].message.content;
    let messages;
    try {
      messages = JSON.parse(content);
    } catch (e) {
      // If the response isn't valid JSON, create a simple message array
      messages = [
        {
          content: content,
          sender: "User",
          timestamp: new Date().toLocaleTimeString(),
          isUser: true
        }
      ];
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