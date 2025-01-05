export const generateConversationHtml = (messages: any[]) => {
  console.log('Generating HTML for messages:', messages.length);
  
  const conversationHtml = messages.map((msg: any, index: number) => `
    <div class="message ${msg.isUser ? 'user' : 'friend'}">
      <div class="bubble">
        ${msg.content}
        ${msg.audioUrl ? `<audio src="${msg.audioUrl}" autoplay></audio>` : ''}
      </div>
      <div class="timestamp">${new Date().toLocaleTimeString()}</div>
    </div>
  `).join('');

  return `
    <div class="conversation" style="
      background-color: #F5F5F5;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    ">
      ${conversationHtml}
    </div>
  `;
};