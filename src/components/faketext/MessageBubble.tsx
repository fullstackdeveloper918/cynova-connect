interface MessageBubbleProps {
  message: string;
  isUser: boolean;
  timestamp: string;
  isDarkMode: boolean;
}

export const MessageBubble = ({ message, isUser, timestamp, isDarkMode }: MessageBubbleProps) => {
  return (
    <div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}
    >
      <div className="max-w-[70%]">
        <div
          className={`rounded-2xl px-4 py-2 ${
            isUser
              ? 'bg-primary text-white rounded-br-sm'
              : isDarkMode
                ? 'bg-[#1c1c1e] text-white rounded-bl-sm'
                : 'bg-white text-gray-900 rounded-bl-sm'
          }`}
          style={{
            boxShadow: isDarkMode 
              ? '0 1px 2px rgba(255, 255, 255, 0.05)' 
              : '0 1px 2px rgba(0, 0, 0, 0.05)'
          }}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message}</p>
        </div>
        <div
          className={`text-xs mt-1 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          } ${isUser ? 'text-right' : 'text-left'}`}
        >
          {timestamp}
        </div>
      </div>
    </div>
  );
};