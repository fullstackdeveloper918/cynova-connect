import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OpenAI } from "https://esm.sh/openai@4.28.0";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { script, numberOfFrames } = await req.json();
    
    if (!script) {
      throw new Error('Script is required');
    }

    console.log('Generating frames for script:', script);
    console.log('Number of frames to generate:', numberOfFrames);

    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const openai = new OpenAI({ apiKey: openAiKey });

    // Split script into meaningful sections
    const sentences = script.split(/[.!?]+/).filter(Boolean).map(s => s.trim());
    const sectionsPerFrame = Math.ceil(sentences.length / numberOfFrames);
    
    const framePrompts = [];
    for (let i = 0; i < numberOfFrames; i++) {
      const startIndex = i * sectionsPerFrame;
      const endIndex = Math.min((i + 1) * sectionsPerFrame, sentences.length);
      const relevantSentences = sentences.slice(startIndex, endIndex).join('. ');
      
      const prompt = `Create a vertical video frame that vividly illustrates this scene: "${relevantSentences}". 
      Requirements:
      - Vertical composition (9:16 aspect ratio)
      - Clear focal point
      - Suitable for social media video
      - Simple, clear imagery that captures the main action`;
      
      framePrompts.push(prompt);
    }

    console.log('Generated prompts:', framePrompts);
    
    const frameUrls = await Promise.all(
      framePrompts.map(async (prompt, index) => {
        try {
          console.log(`Starting generation for frame ${index + 1} with prompt:`, prompt);
          
          const response = await openai.images.generate({
            model: "dall-e-2",  // Using DALL-E-2 instead of DALL-E-3
            prompt,
            n: 1,
            size: "1024x1024",  // DALL-E-2 doesn't support custom aspect ratios
            response_format: "b64_json"  // Get base64 directly to avoid extra HTTP requests
          });

          // Convert base64 to data URL
          const base64 = response.data[0].b64_json;
          const dataUrl = `data:image/jpeg;base64,${base64}`;
          
          console.log(`Frame ${index + 1} generated successfully`);
          return dataUrl;
        } catch (error) {
          console.error(`Error generating frame ${index + 1}:`, error);
          throw error;
        }
      })
    );

    return new Response(
      JSON.stringify({
        success: true,
        frameUrls
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error in generate-video-frames:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message 
      }),
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