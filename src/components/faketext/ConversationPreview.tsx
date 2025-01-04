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
  const audioElements = useRef<Map<string, HTMLAudioElement>>(new Map());
  const currentAudioIndex = useRef<number>(0);

  useEffect(() => {
    if (!messages.length) {
      setVisibleMessages([]);
      return;
    }

    // Reset visible messages and audio when new messages arrive
    setVisibleMessages([]);
    audioElements.current.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    audioElements.current.clear();
    currentAudioIndex.current = 0;

    // Calculate delay between messages based on total duration
    const totalDuration = 30000; // 30 seconds in milliseconds
    const messageDelay = totalDuration / messages.length;

    // Initialize audio elements for each message with narration
    messages.forEach((message, index) => {
      if (message.audioUrl) {
        const audio = new Audio(message.audioUrl);
        audio.addEventListener('ended', () => {
          // Play next audio if available
          if (currentAudioIndex.current < messages.length - 1) {
            currentAudioIndex.current++;
            const nextAudio = audioElements.current.get(messages[currentAudioIndex.current].content);
            nextAudio?.play().catch(error => {
              console.error('Error playing next narration:', error);
            });
          }
        });
        audioElements.current.set(message.content, audio);
      }
    });

    // Play message received sound and show messages sequentially
    const playMessageSound = (index: number) => {
      if (!audioContext.current) {
        audioContext.current = new AudioContext();
      }

      // Play notification sound
      oscillator.current = audioContext.current.createOscillator();
      const gainNode = audioContext.current.createGain();

      oscillator.current.connect(gainNode);
      gainNode.connect(audioContext.current.destination);

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

      // Play narration if this is the first message
      if (index === 0) {
        const firstAudio = audioElements.current.get(messages[0].content);
        if (firstAudio) {
          firstAudio.play().catch(error => {
            console.error('Error playing first narration:', error);
          });
        }
      }
    };

    // Animate messages appearing one by one with sound
    messages.forEach((message, index) => {
      setTimeout(() => {
        setVisibleMessages((prev) => [...prev, message]);
        playMessageSound(index);
      }, index * messageDelay);
    });

    // Cleanup function
    return () => {
      if (audioContext.current?.state !== "closed") {
        audioContext.current?.close();
      }
      audioElements.current.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
      audioElements.current.clear();
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