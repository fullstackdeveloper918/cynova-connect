import { useEffect, useRef, useState } from "react";
import { Message } from "./types";
import { PreviewControls } from "./PreviewControls";
import { MessageList } from "./MessageList";
import { AudioPlayer } from "./AudioPlayer";

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
  const audioPlayerRef = useRef<AudioPlayer>(new AudioPlayer());

  useEffect(() => {
    const audioPlayer = audioPlayerRef.current;

    if (!messages.length) {
      setVisibleMessages([]);
      audioPlayer.cleanup();
      return;
    }

    // Reset state and initialize audio
    setVisibleMessages([]);
    audioPlayer.initialize(messages);

    const playMessageSequence = async (index: number) => {
      if (index >= messages.length) {
        audioPlayer.setIsPlaying(false);
        return;
      }

      // Show current message
      setVisibleMessages(prev => [...prev, messages[index]]);

      try {
        // Play audio if available
        await audioPlayer.playAudio(index);
      } catch (error) {
        console.error('Failed to play audio for message:', index, error);
      }

      // Add delay between messages
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Continue to next message
      await playMessageSequence(index + 1);
    };

    // Start the sequence
    if (messages.length > 0) {
      audioPlayer.setIsPlaying(true);
      playMessageSequence(0);
    }

    // Cleanup
    return () => {
      audioPlayer.cleanup();
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
          <MessageList messages={visibleMessages} isDarkMode={isDarkMode} />
        </div>
      </div>
    </div>
  );
};