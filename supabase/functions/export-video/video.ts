// Poll for video generation completion
export const pollVideoGeneration = async (predictionId: string): Promise<string> => {
  console.log('Polling for video generation completion...');
  let attempts = 0;
  const maxAttempts = 60;

  while (attempts < maxAttempts) {
    const response = await fetch(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      {
        headers: {
          Authorization: `Token ${Deno.env.get('REPLICATE_API_KEY')}`,
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
      return prediction.output;
    } else if (prediction.status === 'failed') {
      throw new Error('Video generation failed');
    }

    attempts++;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  throw new Error('Video generation timed out');
};

// Generate video using Replicate
export const generateVideo = async (messages: any[]) => {
  console.log('Starting video generation with Replicate...');
  
  // Create HTML representation of the iMessage conversation
  const conversationHtml = messages.map(msg => `
    <div class="message ${msg.isUser ? 'user' : 'friend'}">
      <div class="bubble">
        ${msg.content}
      </div>
      <div class="timestamp">${msg.timestamp}</div>
    </div>
  `).join('');

  const htmlTemplate = `
    <div class="conversation" style="
      background-color: #F5F5F5;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    ">
      ${conversationHtml}
    </div>
  `;

  // Use Replicate to create video from HTML
  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${Deno.env.get('REPLICATE_API_KEY')}`,
    },
    body: JSON.stringify({
      version: "2b017d9b67edd2ee1401238df49d75da53c523f36e363881e057f5dc3ed3c5b2",
      input: {
        html: htmlTemplate,
        width: 1080,
        height: 1920,
        fps: 30,
        duration: 10,
        quality: "high",
        format: "mp4",
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Replicate API error: ${await response.text()}`);
  }

  return await response.json();
};