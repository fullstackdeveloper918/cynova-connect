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
  const audioElements = useRef<Map<number, HTMLAudioElement>>(new Map());
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!messages.length) {
      setVisibleMessages([]);
      return;
    }

    // Reset state
    setVisibleMessages([]);
    audioElements.current.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    audioElements.current.clear();
    setIsPlaying(false);

    // Calculate delay between messages
    const totalDuration = 30000; // 30 seconds
    const messageDelay = totalDuration / messages.length;

    // Initialize audio elements
    messages.forEach((message, index) => {
      if (message.audioUrl) {
        const audio = new Audio(message.audioUrl);
        
        // Set up audio event listeners
        audio.addEventListener('ended', () => {
          // Play next audio if available
          const nextAudio = audioElements.current.get(index + 1);
          if (nextAudio) {
            nextAudio.play().catch(console.error);
          } else {
            setIsPlaying(false);
          }
        });

        audio.addEventListener('error', (e) => {
          console.error('Audio playback error:', e);
        });

        audioElements.current.set(index, audio);
      }
    });

    // Show messages sequentially and play corresponding audio
    messages.forEach((message, index) => {
      setTimeout(() => {
        setVisibleMessages(prev => [...prev, message]);
        
        // Play audio for this message
        const audio = audioElements.current.get(index);
        if (audio && !isPlaying) {
          setIsPlaying(true);
          audio.play().catch(error => {
            console.error('Error playing audio:', error);
            setIsPlaying(false);
          });
        }
      }, index * messageDelay);
    });

    // Cleanup function
    return () => {
      audioElements.current.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
      audioElements.current.clear();
      setIsPlaying(false);
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