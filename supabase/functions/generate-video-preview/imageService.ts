import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

export const generateImage = async (
  script: string,
  openAiKey: string
) => {
  console.log('Generating image with DALL-E...');
  
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openAiKey}`,
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: script,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "url",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('DALL-E API Error:', error);
    throw new Error(`DALL-E API error: ${error.error?.message || 'Unknown error'}`);
  }

  const result = await response.json();
  return result.data[0].url;
};