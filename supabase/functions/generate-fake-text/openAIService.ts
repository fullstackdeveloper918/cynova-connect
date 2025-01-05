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
      messages: [
        {
          role: 'system',
          content: `Generate a realistic iMessage conversation with exactly ${targetMessageCount} messages that spans ${duration} seconds. Return ONLY a JSON array of messages in this format:
[
  {
    "content": "message text",
    "isUser": boolean,
    "timestamp": "HH:MM AM/PM"
  }
]

Requirements:
- Messages should be natural and conversational
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
    const messages = JSON.parse(data.choices[0].message.content);
    console.log('Parsed messages:', messages);
    
    if (!Array.isArray(messages)) {
      throw new Error('Response is not an array');
    }
    
    messages.forEach((msg: any, index: number) => {
      if (!msg.content || typeof msg.isUser !== 'boolean' || !msg.timestamp) {
        throw new Error(`Invalid message format at index ${index}`);
      }
    });
    
    return { choices: [{ message: { content: JSON.stringify(messages) } }] };
  } catch (error) {
    console.error('Failed to parse OpenAI response:', error);
    console.error('Raw response content:', data.choices[0].message.content);
    throw new Error(`Invalid conversation format: ${error.message}`);
  }
}