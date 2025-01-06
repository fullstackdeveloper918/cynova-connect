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
    const { questions, gameplayUrl } = await req.json();
    
    const elevenLabsKey = Deno.env.get('ELEVEN_LABS_API_KEY');
    if (!elevenLabsKey) {
      throw new Error('ElevenLabs API key is not configured');
    }

    console.log('Generating quiz video with questions:', questions);

    // Generate narration for each question
    const narrations = [];
    for (const question of questions) {
      const script = `Question: ${question.question}. ${
        question.type === 'multiple_choice'
          ? `Options: ${question.options.join(', ')}.`
          : 'Is this true or false?'
      }`;

      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL/stream`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': elevenLabsKey,
          },
          body: JSON.stringify({
            text: script,
            model_id: "eleven_turbo_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate narration');
      }

      const audioData = await response.arrayBuffer();
      narrations.push(audioData);
    }

    // TODO: Implement video generation with gameplay and narration
    // For now, we'll return a mock video URL
    const mockVideoUrl = gameplayUrl;

    return new Response(
      JSON.stringify({ 
        success: true,
        videoUrl: mockVideoUrl,
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error in generate-quiz-video:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});