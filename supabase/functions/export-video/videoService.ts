export const generateVideo = async (
  replicateApiKey: string,
  htmlTemplate: string,
  duration: number
) => {
  console.log('Starting video generation with Replicate...');
  console.log('Video duration:', duration);

  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${replicateApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: "2b017d9b67edd2ee1401238df49d75da53c523f36e363881e057f5dc3ed3c5b2",
      input: {
        html: htmlTemplate,
        width: 1080,
        height: 1920,
        fps: 30,
        duration: duration,
        quality: "high",
        format: "mp4",
        wait_for_audio: true
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Replicate API error:', errorText);
    throw new Error(`Replicate API error: ${errorText}`);
  }

  return await response.json();
};

export const pollVideoGeneration = async (
  replicateApiKey: string,
  predictionId: string
): Promise<string> => {
  console.log('Polling for video completion...');
  let attempts = 0;
  const maxAttempts = 60; // Increased max attempts for longer videos
  const delayMs = 2000; // 2 second delay between attempts

  while (attempts < maxAttempts) {
    console.log(`Polling attempt ${attempts + 1}/${maxAttempts}`);
    const response = await fetch(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      {
        headers: {
          Authorization: `Token ${replicateApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to check prediction status: ${await response.text()}`);
    }

    const prediction = await response.json();
    console.log('Prediction status:', prediction.status);

    if (prediction.status === 'succeeded') {
      console.log('Video generation completed successfully');
      return prediction.output;
    } else if (prediction.status === 'failed') {
      console.error('Video generation failed:', prediction.error);
      throw new Error('Video generation failed: ' + prediction.error);
    }

    attempts++;
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  throw new Error('Video generation timed out');
};