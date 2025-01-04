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
  const nextMessageTimeout = useRef<NodeJS.Timeout>();

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
    if (nextMessageTimeout.current) {
      clearTimeout(nextMessageTimeout.current);
    }

    const playNextMessage = (currentIndex: number) => {
      const nextIndex = currentIndex + 1;
      if (nextIndex < messages.length) {
        nextMessageTimeout.current = setTimeout(() => {
          setVisibleMessages(prev => [...prev, messages[nextIndex]]);
          const nextAudio = audioElements.current.get(nextIndex);
          if (nextAudio) {
            nextAudio.play().catch(error => {
              console.error('Error playing next audio:', error);
              // Continue the chain even if audio fails
              playNextMessage(nextIndex);
            });
          } else {
            // If no audio, still continue the chain
            playNextMessage(nextIndex);
          }
        }, 500);
      } else {
        setIsPlaying(false);
      }
    };

    // Initialize audio elements and set up event listeners
    messages.forEach((message, index) => {
      if (message.audioUrl) {
        const audio = new Audio(message.audioUrl);
        
        audio.addEventListener('ended', () => {
          playNextMessage(index);
        });

        audio.addEventListener('error', (e) => {
          console.error('Audio playback error:', e);
          // Continue the chain even if audio fails
          playNextMessage(index);
        });

        audioElements.current.set(index, audio);
      }
    });

    // Start with the first message
    if (messages.length > 0) {
      setVisibleMessages([messages[0]]);
      const firstAudio = audioElements.current.get(0);
      if (firstAudio) {
        setIsPlaying(true);
        firstAudio.play().catch(error => {
          console.error('Error playing first audio:', error);
          // If first audio fails, start the chain anyway
          playNextMessage(0);
        });
      } else {
        // If no audio for first message, start the chain
        playNextMessage(0);
      }
    }

    // Cleanup function
    return () => {
      if (nextMessageTimeout.current) {
        clearTimeout(nextMessageTimeout.current);
      }
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