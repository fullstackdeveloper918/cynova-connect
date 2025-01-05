import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OpenAI } from "https://esm.sh/openai@4.28.0";
import { corsHeaders } from "../_shared/cors.ts";

// Helper function to add delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

    // Generate at least 4 frames for a 30-second video (one every 7.5 seconds)
    const minFrames = Math.min(4, Math.max(numberOfFrames, 1));
    
    // Split script into meaningful sections
    const sentences = script.split(/[.!?]+/).filter(Boolean).map(s => s.trim());
    const sectionsPerFrame = Math.ceil(sentences.length / minFrames);
    
    const framePrompts = [];
    for (let i = 0; i < minFrames; i++) {
      const startIndex = i * sectionsPerFrame;
      const endIndex = Math.min((i + 1) * sectionsPerFrame, sentences.length);
      const relevantSentences = sentences.slice(startIndex, endIndex).join('. ');
      
      const prompt = `Create a cinematic, photorealistic image that captures this scene: "${relevantSentences}"

      Requirements:
      - Vertical format (9:16 aspect ratio)
      - Photorealistic, cinematic quality
      - Rich colors and dramatic lighting
      - Clear focal point
      - No text or watermarks
      - Natural composition
      - High detail and sharpness`;
      
      framePrompts.push(prompt);
    }

    console.log(`Preparing to generate ${framePrompts.length} frames`);
    
    const frameUrls = [];
    // Generate images sequentially with delay to respect rate limits
    for (let i = 0; i < framePrompts.length; i++) {
      try {
        console.log(`Generating frame ${i + 1}/${framePrompts.length}`);
        
        // Add delay between requests to respect rate limits
        if (i > 0) {
          const delayMs = 12000; // 12 seconds delay between requests
          console.log(`Waiting ${delayMs}ms before generating next frame...`);
          await delay(delayMs);
        }

        const response = await openai.images.generate({
          model: "dall-e-2",
          prompt: framePrompts[i],
          n: 1,
          size: "1024x1024",
          response_format: "b64_json"
        });

        const base64 = response.data[0].b64_json;
        const dataUrl = `data:image/jpeg;base64,${base64}`;
        frameUrls.push(dataUrl);
        
        console.log(`Frame ${i + 1} generated successfully`);
      } catch (error) {
        console.error(`Error generating frame ${i + 1}:`, error);
        // If we hit rate limit, wait longer before retrying
        if (error.message?.includes('Rate limit exceeded')) {
          console.log('Rate limit hit, waiting 60 seconds before retry...');
          await delay(60000);
          i--; // Retry this frame
          continue;
        }
        throw error;
      }
    }

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