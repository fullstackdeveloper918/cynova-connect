export async function generateConversation(openAiKey: string, topic: string, prompt: string, targetMessageCount: number, duration: number): Promise<any> {
  console.log('Generating conversation with parameters:', { topic, targetMessageCount, duration });
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a JSON generator that creates realistic iMessage conversations. Generate a conversation with exactly ${targetMessageCount} messages that spans ${duration} seconds.

Format each message as:
{
  "content": "message text",
  "isUser": boolean,
  "timestamp": "HH:MM AM/PM"
}

Requirements:
- Return ONLY a valid JSON array of messages, no other text
- Keep messages natural and conversational
- Alternate between isUser true/false
- Space timestamps evenly across the duration
- Keep messages under 10 words for better audio generation

Example valid response:
[
  {
    "content": "Hey, what's up?",
    "isUser": true,
    "timestamp": "2:30 PM"
  },
  {
    "content": "Just finished work, you?",
    "isUser": false,
    "timestamp": "2:31 PM"
  }
]`
        },
        {
          role: 'user',
          content: `Topic: ${topic}. Additional context: ${prompt}`
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('OpenAI API Error:', error);
    throw new Error(error.error?.message || 'Failed to generate conversation');
  }

  const data = await response.json();
  console.log('Raw OpenAI response:', data.choices[0].message.content);
  
  try {
    // Parse and validate the response
    const messages = JSON.parse(data.choices[0].message.content);
    
    if (!Array.isArray(messages)) {
      throw new Error('Response is not an array');
    }
    
    messages.forEach((msg: any, index: number) => {
      if (!msg.content || typeof msg.isUser !== 'boolean' || !msg.timestamp) {
        throw new Error(`Invalid message format at index ${index}`);
      }
    });
    
    console.log(`Successfully parsed ${messages.length} messages`);
    return data;
  } catch (error) {
    console.error('Failed to parse OpenAI response:', error);
    console.error('Raw response content:', data.choices[0].message.content);
    throw new Error(`Invalid conversation format: ${error.message}`);
  }
}