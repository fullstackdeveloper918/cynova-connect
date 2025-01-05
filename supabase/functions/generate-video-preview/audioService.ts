export const generateAudio = async (
  script: string,
  voiceId: string,
  elevenLabsKey: string
) => {
  console.log('Generating audio with ElevenLabs using voice ID:', voiceId);
  
  const response = await fetch(
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
        model_id: "eleven_turbo_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('ElevenLabs API Error:', error);
    throw new Error(`ElevenLabs API error: ${error}`);
  }

  return response;
};