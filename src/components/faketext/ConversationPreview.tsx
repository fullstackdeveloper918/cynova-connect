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

    // Initialize audio elements
    messages.forEach((message, index) => {
      if (message.audioUrl) {
        const audio = new Audio(message.audioUrl);
        audioElements.current.set(index, audio);
      }
    });

    const playAudio = async (audio: HTMLAudioElement): Promise<void> => {
      return new Promise((resolve, reject) => {
        const handleEnded = () => {
          audio.removeEventListener('ended', handleEnded);
          audio.removeEventListener('error', handleError);
          resolve();
        };

        const handleError = (error: Event) => {
          audio.removeEventListener('ended', handleEnded);
          audio.removeEventListener('error', handleError);
          console.error('Audio playback error:', error);
          reject(error);
        };

        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);

        // Start playing and handle any immediate errors
        audio.play().catch(error => {
          console.error('Error starting audio:', error);
          handleError(error);
        });
      });
    };

    const playMessageSequence = async (index: number) => {
      if (index >= messages.length) {
        setIsPlaying(false);
        return;
      }

      // Show current message
      setVisibleMessages(prev => [...prev, messages[index]]);

      // Play audio if available
      const currentAudio = audioElements.current.get(index);
      if (currentAudio) {
        try {
          await playAudio(currentAudio);
        } catch (error) {
          console.error('Failed to play audio for message:', index, error);
        }
      }

      // Add delay between messages
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Continue to next message
      await playMessageSequence(index + 1);
    };

    // Start the sequence
    if (messages.length > 0) {
      setIsPlaying(true);
      playMessageSequence(0);
    }

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