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
          content: `You are a conversation generator that creates realistic iMessage conversations.
Generate a conversation about "${topic}" with exactly ${targetMessageCount} messages that spans ${duration} seconds.

Format your response as a JSON array of messages with this structure:
[
  {
    "content": "message text",
    "isUser": true/false,
    "timestamp": "HH:MM AM/PM"
  }
]

Requirements:
- Messages should be natural and conversational
- Alternate between isUser true/false
- Space timestamps evenly across ${duration} seconds
- Keep messages concise (under 10 words) for better audio
- Include ONLY the JSON array in your response, no other text`
        },
        {
          role: 'user',
          content: `Generate a conversation about: ${topic}. Additional context: ${prompt}`
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
  console.log('Raw OpenAI response:', data);
  
  try {
    // Extract the content from the response
    const content = data.choices[0].message.content.trim();
    console.log('Response content:', content);
    
    // Try to parse the JSON response
    let messages;
    try {
      messages = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse initial JSON:', parseError);
      // Try to extract JSON array if there's additional text
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        messages = JSON.parse(jsonMatch[0]);
      } else {
        throw parseError;
      }
    }
    
    if (!Array.isArray(messages)) {
      throw new Error('Response is not an array');
    }
    
    // Validate each message
    messages.forEach((msg: any, index: number) => {
      if (!msg.content || typeof msg.isUser !== 'boolean' || !msg.timestamp) {
        throw new Error(`Invalid message format at index ${index}`);
      }
    });
    
    console.log(`Successfully parsed ${messages.length} messages:`, messages);
    return { choices: [{ message: { content: JSON.stringify(messages) } }] };
  } catch (error) {
    console.error('Failed to parse OpenAI response:', error);
    console.error('Raw response content:', data.choices[0].message.content);
    throw new Error(`Invalid conversation format: ${error.message}`);
  }
}