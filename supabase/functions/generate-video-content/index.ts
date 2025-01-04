import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      console.error('OpenAI API key is not configured');
      throw new Error('OpenAI API key is not configured');
    }

    const { prompt, style } = await req.json();
    console.log('Received prompt:', prompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a video script writer. Create engaging, clear, and concise scripts in a ${style || 'casual'} style. Include natural pauses and emphasis points.`
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000, // Limit token usage
      }),
    });

    const data = await response.json();
    console.log('OpenAI API response status:', response.status);

    if (!response.ok) {
      // Check specifically for quota exceeded error
      if (response.status === 429 || data.error?.message?.includes('quota')) {
        console.error('OpenAI API rate limit or quota exceeded:', data.error);
        return new Response(
          JSON.stringify({
            error: 'Rate limit reached. Please try again in a few moments.',
            details: data.error?.message
          }),
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid response format from OpenAI:', data);
      throw new Error('Invalid response format from OpenAI API');
    }

    const generatedText = data.choices[0].message.content;
    console.log('Successfully generated script of length:', generatedText.length);

    return new Response(
      JSON.stringify({ script: generatedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-video-content function:', error);
    
    // Determine if it's a rate limit error
    const isRateLimit = error.message?.includes('quota') || error.message?.includes('rate limit');
    
    return new Response(
      JSON.stringify({ 
        error: isRateLimit ? 'Rate limit reached. Please try again in a few moments.' : 'An error occurred while generating content',
        details: error.toString()
      }),
      { 
        status: isRateLimit ? 429 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});