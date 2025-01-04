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
      }),
    });

    const data = await response.json();
    console.log('OpenAI API response:', data);

    if (!response.ok) {
      // Check specifically for quota exceeded error
      if (data.error?.message?.includes('exceeded your current quota')) {
        console.error('OpenAI API quota exceeded:', data.error);
        return new Response(
          JSON.stringify({
            error: 'OpenAI API quota exceeded. Please try again later or contact support.',
            details: data.error.message
          }),
          {
            status: 429, // Too Many Requests
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
    console.log('Successfully generated text:', generatedText.substring(0, 100) + '...');

    return new Response(
      JSON.stringify({ script: generatedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-video-content function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred while generating content',
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});