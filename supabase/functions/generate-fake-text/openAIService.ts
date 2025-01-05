export async function generateConversation(openAiKey: string, topic: string, prompt: string, targetMessageCount: number, duration: number): Promise<any> {
  console.log('Generating conversation with parameters:', { topic, targetMessageCount, duration });
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      response_format: { type: "json_object" },
      messages: [
        {
          role: 'system',
          content: `You are a JSON generator that creates realistic iMessage conversations. You must return a valid JSON object with a "messages" array containing exactly ${targetMessageCount} messages that spans ${duration} seconds.

Your response must be a JSON object in this exact format:
{
  "messages": [
    {
      "content": "message text",
      "isUser": boolean,
      "timestamp": "HH:MM AM/PM"
    }
  ]
}

Requirements:
- Return ONLY valid JSON, no explanatory text
- Keep messages natural and conversational
- Alternate between isUser true/false
- Space timestamps evenly across the duration
- Keep messages under 10 words for better audio generation`
        },
        {
          role: 'user',
          content: `Topic: ${topic}. Additional context: ${prompt}`
        }
      ],
      temperature: 0.7
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('OpenAI API Error:', error);
    throw new Error(error.error?.message || 'Failed to generate conversation');
  }

  const data = await response.json();
  console.log('Raw OpenAI response:', data);
  
  try {
    const content = data.choices[0].message.content;
    console.log('Response content:', content);
    
    // Parse the JSON response
    const parsedResponse = JSON.parse(content);
    console.log('Parsed response:', parsedResponse);
    
    if (!parsedResponse.messages || !Array.isArray(parsedResponse.messages)) {
      throw new Error('Response does not contain a messages array');
    }
    
    // Validate each message
    parsedResponse.messages.forEach((msg: any, index: number) => {
      if (!msg.content || typeof msg.isUser !== 'boolean' || !msg.timestamp) {
        throw new Error(`Invalid message format at index ${index}`);
      }
    });
    
    console.log(`Successfully parsed ${parsedResponse.messages.length} messages`);
    return { choices: [{ message: { content: JSON.stringify(parsedResponse.messages) } }] };
  } catch (error) {
    console.error('Failed to parse OpenAI response:', error);
    console.error('Raw response content:', data.choices[0].message.content);
    throw new Error(`Invalid conversation format: ${error.message}`);
  }
}