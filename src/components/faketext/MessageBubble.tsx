interface MessageBubbleProps {
  message: string;
  isUser: boolean;
  timestamp: string;
}

export const MessageBubble = ({ message, isUser, timestamp }: MessageBubbleProps) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[70%]">
        <div
          className={`rounded-2xl px-4 py-2 ${
            isUser
              ? 'bg-primary text-white ml-auto'
              : 'bg-white text-gray-900'
          }`}
        >
          <p className="text-sm">{message}</p>
        </div>
        <div
          className={`text-xs text-gray-500 mt-1 ${
            isUser ? 'text-right' : 'text-left'
          }`}
        >
          {timestamp}
        </div>
      </div>
    </div>
  );
};