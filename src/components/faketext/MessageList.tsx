import { Message } from "./types";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
  messages: Message[];
  isDarkMode: boolean;
}

export const MessageList = ({ messages, isDarkMode }: MessageListProps) => {
  return (
    <div className="space-y-4">
      <div
        className={`text-center text-sm ${
          isDarkMode ? "text-gray-400" : "text-gray-500"
        } pb-2`}
      >
        Today
      </div>
      {messages.map((message, index) => (
        <MessageBubble
          key={index}
          message={message.content}
          isUser={message.isUser}
          timestamp={message.timestamp}
          isDarkMode={isDarkMode}
        />
      ))}
    </div>
  );
};