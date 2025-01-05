import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2';
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

    const hfToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
    if (!hfToken) {
      throw new Error('HUGGING_FACE_ACCESS_TOKEN is not set');
    }

    const hf = new HfInference(hfToken);

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
      - Cinematic quality
      - Vertical composition (9:16 aspect ratio)
      - Clear focal point
      - Suitable for social media video`;
      
      framePrompts.push(prompt);
    }

    console.log('Generated prompts:', framePrompts);
    
    const frameUrls = await Promise.all(
      framePrompts.map(async (prompt, index) => {
        try {
          console.log(`Starting generation for frame ${index + 1} with prompt:`, prompt);
          
          const image = await hf.textToImage({
            inputs: prompt,
            model: "black-forest-labs/FLUX.1-schnell",
            parameters: {
              height: 1024,
              width: 576,
            }
          });

          // Convert blob to base64
          const arrayBuffer = await image.arrayBuffer();
          const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
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