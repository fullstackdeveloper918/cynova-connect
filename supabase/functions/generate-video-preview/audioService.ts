export const generateAudio = async (
  script: string,
  voiceId: string,
  elevenLabsKey: string
) => {
  console.log('Generating audio narration with ElevenLabs...');
  
  const audioResponse = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsKey,
      },
      body: JSON.stringify({
        text: script,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    }
  );

  if (!audioResponse.ok) {
    const error = await audioResponse.text();
    console.error('ElevenLabs API Error:', error);
    throw new Error(`ElevenLabs API error: ${error}`);
  }

  return audioResponse;
};