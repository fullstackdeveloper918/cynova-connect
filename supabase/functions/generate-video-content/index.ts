import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prompt, style = "professional", minWords = 100, targetDuration = 30 } = await req.json();
    console.log('Generating video content for prompt:', prompt);
    console.log('Target duration:', targetDuration, 'seconds');
    console.log('Minimum words:', minWords);

    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) {
      throw new Error('Missing OpenAI API key');
    }

    console.log('Calling OpenAI API...');
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
            content: `You are a storyteller creating engaging content. Write naturally flowing narratives that take ${targetDuration} seconds to read at a comfortable pace (150 words per minute). Focus on vivid descriptions and engaging storytelling without any meta-commentary or technical instructions.`
          },
          {
            role: 'user',
            content: `Create an engaging story or description about: ${prompt}
            Requirements:
            - Write at least ${minWords} words
            - Use natural, conversational language
            - Include vivid details and descriptions
            - Maintain a ${style} tone
            - DO NOT include any technical terms, narration instructions, or scene descriptions
            - Focus purely on the story or content itself`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API Error:', error);
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    const script = data.choices[0].message.content.trim();
    console.log('Generated script:', script);
    console.log('Script word count:', script.split(/\s+/).length);

    return new Response(
      JSON.stringify({ script }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-video-content:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});