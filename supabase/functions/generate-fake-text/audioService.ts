import { Message } from "./types.ts";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export async function generateAudioWithRetry(
  message: string, 
  index: number, 
  elevenLabsKey: string, 
  voiceId: string, 
  retryCount = 0
): Promise<ArrayBuffer> {
  try {
    console.log(`Generating audio for message ${index}, attempt ${retryCount + 1}`);
    const audioResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsKey,
        },
        body: JSON.stringify({
          text: message,
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    );

    if (!audioResponse.ok) {
      const errorText = await audioResponse.text();
      throw new Error(`ElevenLabs API error (${audioResponse.status}): ${errorText}`);
    }

    const audioBuffer = await audioResponse.arrayBuffer();
    if (!audioBuffer || audioBuffer.byteLength === 0) {
      throw new Error('Received empty audio buffer');
    }

    console.log(`Successfully generated audio for message ${index}`);
    return audioBuffer;
  } catch (error) {
    console.error(`Error generating audio for message ${index}:`, error);
    
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying audio generation for message ${index} after ${RETRY_DELAY}ms`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return generateAudioWithRetry(message, index, elevenLabsKey, voiceId, retryCount + 1);
    }
    
    throw new Error(`Failed to generate audio after ${MAX_RETRIES} attempts: ${error.message}`);
  }
}