export const generateAudio = async (
  script: string,
  voiceId: string,
  elevenLabsKey: string
) => {
  console.log('Generating audio with ElevenLabs using voice ID:', voiceId);
  
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
        model_id: "eleven_turbo_v2", // Using fastest model for testing
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0, // Neutral style for testing
          use_speaker_boost: false // Disable speaker boost for testing
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