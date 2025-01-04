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
    const { prompt, style = "engaging and professional" } = await req.json();
    console.log('Received prompt:', prompt);

    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    console.log('Generating script with OpenAI...');
    
    // Generate script using GPT-4
    const scriptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `You are a professional video script writer. Create engaging, ${style} scripts that are concise and visually descriptive. Break down the script into clear scenes that can be visualized.`
          },
          {
            role: 'user',
            content: `Write a short video script about: ${prompt}. Keep it under 60 seconds when read aloud. Focus on visual descriptions that can be animated. Format the response as a JSON array of scenes, where each scene has a "description" and "duration" in seconds.`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    const scriptData = await scriptResponse.json();
    console.log('Script generated:', scriptData);

    if (!scriptResponse.ok) {
      throw new Error(scriptData.error?.message || 'Failed to generate script');
    }

    const scenes = JSON.parse(scriptData.choices[0].message.content).scenes;

    // Generate images for each scene using DALL-E 3
    console.log('Generating images for scenes...');
    const imagePromises = scenes.map(async (scene: any) => {
      const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: scene.description,
          n: 1,
          size: "1024x1024",
          quality: "standard",
          style: "vivid",
        }),
      });

      const imageData = await imageResponse.json();
      if (!imageResponse.ok) {
        throw new Error(imageData.error?.message || 'Failed to generate image');
      }

      return {
        ...scene,
        imageUrl: imageData.data[0].url,
      };
    });

    const scenesWithImages = await Promise.all(imagePromises);
    console.log('All scenes generated with images');

    return new Response(
      JSON.stringify({ 
        scenes: scenesWithImages,
        message: "Video content generated successfully" 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in generate-video-content function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate video content',
        details: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});