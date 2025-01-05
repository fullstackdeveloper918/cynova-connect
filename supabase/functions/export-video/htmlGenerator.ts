export const generateConversationHtml = (messages: any[]) => {
  console.log('Generating HTML for messages:', messages.length);
  
  const conversationHtml = messages.map((msg: any, index: number) => `
    <div class="message ${msg.isUser ? 'user' : 'friend'}" style="
      opacity: 0;
      animation: fadeIn 0.5s ease-in-out ${index * 0.5}s forwards;
      margin: ${msg.isUser ? '10px 10px 10px auto' : '10px auto 10px 10px'};
      max-width: 70%;
      text-align: ${msg.isUser ? 'right' : 'left'};
    ">
      <div class="bubble" style="
        background-color: ${msg.isUser ? '#007AFF' : '#E9E9EB'};
        color: ${msg.isUser ? 'white' : 'black'};
        padding: 12px 16px;
        border-radius: 18px;
        font-size: 16px;
        line-height: 1.4;
        position: relative;
        word-wrap: break-word;
      ">
        ${msg.content}
        ${msg.audioUrl ? `<audio src="${msg.audioUrl}" autoplay style="display: none;"></audio>` : ''}
      </div>
      <div class="timestamp" style="
        font-size: 12px;
        color: #8E8E93;
        margin-top: 4px;
      ">${new Date().toLocaleTimeString()}</div>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .conversation {
          background-color: #F5F5F5;
          padding: 20px;
          min-height: 100vh;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }
      </style>
    </head>
    <body>
      <div class="conversation">
        ${conversationHtml}
      </div>
    </body>
    </html>
  `;
};