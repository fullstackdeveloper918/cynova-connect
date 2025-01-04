// Generate audio narration using ElevenLabs
export const generateAudioNarration = async (script: string, voiceId: string) => {
  console.log('Generating audio with ElevenLabs...');
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': Deno.env.get('ELEVEN_LABS_API_KEY') ?? '',
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

  if (!response.ok) {
    const error = await response.json();
    console.error('ElevenLabs API Error:', error);
    throw new Error('Failed to generate audio narration');
  }

  return await response.arrayBuffer();
};