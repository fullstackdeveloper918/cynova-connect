export async function generateConversation(openAiKey: string, topic: string, prompt: string, targetMessageCount: number, duration: number): Promise<any> {
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
          content: `You are a JSON generator that creates iMessage conversations. You must ONLY return a valid JSON array.
          
          Required format:
          [
            {
              "content": "message text here",
              "isUser": true,
              "timestamp": "2:30 PM"
            }
          ]
          
          Rules:
          1. Return ONLY the JSON array, no other text
          2. Generate exactly ${targetMessageCount} messages
          3. Keep messages under 10 words
          4. Alternate isUser between true/false
          5. Space timestamps over ${duration} seconds
          6. Include quick reactions like "Really?", "No way!"
          7. NEVER apologize or explain - just return the JSON`
        },
        {
          role: 'user',
          content: `Topic: ${topic}. Context: ${prompt}`
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
  
  return data;
}