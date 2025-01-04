import { useEffect, useRef, useState } from "react";
import { Message } from "./types";
import { MessageBubble } from "./MessageBubble";
import { PreviewControls } from "./PreviewControls";

interface ConversationPreviewProps {
  messages: Message[];
  onExport: () => Promise<void>;
  exporting: boolean;
}

export const ConversationPreview = ({
  messages,
  onExport,
  exporting,
}: ConversationPreviewProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
  const audioContext = useRef<AudioContext | null>(null);
  const oscillator = useRef<OscillatorNode | null>(null);
  const audioElement = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!messages.length) {
      setVisibleMessages([]);
      return;
    }

    // Reset visible messages when new messages arrive
    setVisibleMessages([]);

    // Calculate delay between messages based on total duration
    const totalDuration = 30000; // 30 seconds in milliseconds
    const messageDelay = totalDuration / messages.length;

    // Play message received sound
    const playMessageSound = (index: number) => {
      if (!audioContext.current) {
        audioContext.current = new AudioContext();
      }

      oscillator.current = audioContext.current.createOscillator();
      const gainNode = audioContext.current.createGain();

      oscillator.current.connect(gainNode);
      gainNode.connect(audioContext.current.destination);

      // Different sound for user vs non-user messages
      oscillator.current.frequency.value = messages[index].isUser ? 800 : 600;
      gainNode.gain.value = 0.1;

      oscillator.current.start();
      gainNode.gain.exponentialRampToValueAtTime(
        0.00001,
        audioContext.current.currentTime + 0.2
      );

      setTimeout(() => {
        oscillator.current?.stop();
      }, 200);

      // Play narration if available
      if (messages[index].audioUrl) {
        if (!audioElement.current) {
          audioElement.current = new Audio();
        }
        audioElement.current.src = messages[index].audioUrl;
        audioElement.current.play().catch(error => {
          console.error('Error playing narration:', error);
        });
      }
    };

    // Animate messages appearing one by one with sound
    messages.forEach((message, index) => {
      setTimeout(() => {
        setVisibleMessages((prev) => [...prev, message]);
        playMessageSound(index);
      }, index * messageDelay); // Use calculated delay
    });

    // Cleanup audio context and element on unmount
    return () => {
      if (audioContext.current?.state !== "closed") {
        audioContext.current?.close();
      }
      if (audioElement.current) {
        audioElement.current.pause();
        audioElement.current = null;
      }
    };
  }, [messages]);

  return (
    <div className="space-y-6">
      <PreviewControls
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onExport={onExport}
        exporting={exporting}
      />

      <div className="space-y-4">
        <div
          className={`rounded-lg p-4 space-y-4 border ${
            isDarkMode
              ? "bg-[#000000] border-gray-800"
              : "bg-[#F5F5F5] border-gray-200"
          }`}
          style={{
            backgroundImage: isDarkMode
              ? "linear-gradient(to bottom, #1a1a1a, #000000)"
              : "linear-gradient(to bottom, #ffffff, #f5f5f5)",
          }}
        >
          <div
            className={`text-center text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            } pb-2`}
          >
            Today
          </div>
          {visibleMessages.map((message, index) => (
            <MessageBubble
              key={index}
              message={message.content}
              isUser={message.isUser}
              timestamp={message.timestamp}
              isDarkMode={isDarkMode}
            />
          ))}
        </div>
      </div>
    </div>
  );
};