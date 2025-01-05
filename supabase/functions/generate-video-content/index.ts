import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
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

    // Generate script using OpenAI
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
            content: `You are a professional video script writer. Create engaging, detailed scripts that take approximately ${targetDuration} seconds to narrate at a natural pace (approximately 150 words per minute). Include vivid visual descriptions that can be used to generate relevant images.`
          },
          {
            role: 'user',
            content: `Write a detailed, visually descriptive script about: ${prompt}. 
            The script should:
            - Be at least ${minWords} words
            - Take ${targetDuration} seconds to narrate naturally
            - Include clear visual scenes that can be illustrated
            - Be engaging and ${style}
            - Focus on descriptive, visual language`
          }
        ],
        temperature: 0.7,
        max_tokens: 500, // Increased for longer scripts
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