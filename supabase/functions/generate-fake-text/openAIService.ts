export async function generateConversation(openAiKey: string, topic: string, prompt: string, targetMessageCount: number, duration: number): Promise<any> {
  console.log('Generating conversation with parameters:', { topic, targetMessageCount, duration });
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a conversation generator. Create an iMessage chat about "${topic}" with exactly ${targetMessageCount} messages over ${duration} seconds.

Output format: JSON array only, no other text:
[{"content": "message text", "isUser": true/false, "timestamp": "HH:MM AM/PM"}]

Rules:
- Natural conversation style
- Alternate isUser true/false
- Space timestamps over ${duration} seconds
- Keep messages under 10 words
- ONLY return the JSON array`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('OpenAI API Error:', error);
    throw new Error(error.error?.message || 'Failed to generate conversation');
  }

  const data = await response.json();
  console.log('OpenAI raw response:', data);
  
  try {
    const content = data.choices[0].message.content.trim();
    console.log('Content to parse:', content);
    
    const messages = JSON.parse(content);
    
    if (!Array.isArray(messages)) {
      throw new Error('Response is not an array');
    }
    
    // Validate message format
    messages.forEach((msg, index) => {
      if (!msg.content || typeof msg.isUser !== 'boolean' || !msg.timestamp) {
        console.error('Invalid message:', msg);
        throw new Error(`Message ${index} is missing required fields`);
      }
    });
    
    console.log('Successfully parsed messages:', messages);
    return { choices: [{ message: { content: JSON.stringify(messages) } }] };
  } catch (error) {
    console.error('Failed to parse response:', error);
    console.error('Raw content:', data.choices[0].message.content);
    throw new Error(`Invalid response format: ${error.message}`);
  }
}