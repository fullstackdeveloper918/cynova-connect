import { Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2, Sun, Moon } from "lucide-react";
import { Message } from "./types";
import { MessageBubble } from "./MessageBubble";
import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";

interface ConversationPreviewProps {
  messages: Message[];
  onExport: () => Promise<void>;
  exporting: boolean;
}

export const ConversationPreview = ({ messages, onExport, exporting }: ConversationPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (!messages.length) {
      setVisibleMessages([]);
      return;
    }

    // Reset visible messages when new messages arrive
    setVisibleMessages([]);
    
    // Animate messages appearing one by one
    messages.forEach((message, index) => {
      setTimeout(() => {
        setVisibleMessages(prev => [...prev, message]);
      }, index * 1000); // Show each message with a 1-second delay
    });
  }, [messages]);

  useEffect(() => {
    if (!visibleMessages.length || !containerRef.current) return;

    const createVideoPreview = async () => {
      try {
        const initialCanvas = await html2canvas(containerRef.current!);
        const animationCanvas = document.createElement('canvas');
        animationCanvas.width = initialCanvas.width;
        animationCanvas.height = initialCanvas.height;
        const ctx = animationCanvas.getContext('2d');
        
        if (!ctx) return;

        const stream = animationCanvas.captureStream(30);
        const mediaRecorder = new MediaRecorder(stream);
        const chunks: BlobPart[] = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          if (videoRef.current) {
            videoRef.current.src = URL.createObjectURL(blob);
          }
        };

        let currentFrame = 0;
        const animate = () => {
          ctx.clearRect(0, 0, animationCanvas.width, animationCanvas.height);
          ctx.drawImage(initialCanvas, 0, 0);
          
          currentFrame++;
          if (currentFrame < 150) {
            requestAnimationFrame(animate);
          } else {
            mediaRecorder.stop();
          }
        };

        mediaRecorder.start();
        animate();
      } catch (error) {
        console.error('Error creating video preview:', error);
      }
    };

    createVideoPreview();
  }, [visibleMessages]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Preview</h3>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="h-9 w-9"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button 
            onClick={onExport}
            disabled={exporting}
            variant="secondary"
          >
            {exporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Video className="mr-2 h-4 w-4" />
                Export as Video
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div 
          ref={containerRef}
          className={`rounded-lg p-4 space-y-4 border ${
            isDarkMode 
              ? "bg-[#000000] border-gray-800" 
              : "bg-[#F5F5F5] border-gray-200"
          }`}
          style={{
            backgroundImage: isDarkMode 
              ? "linear-gradient(to bottom, #1a1a1a, #000000)"
              : "linear-gradient(to bottom, #ffffff, #f5f5f5)"
          }}
        >
          <div className={`text-center text-sm ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          } pb-2`}>
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

        <video 
          ref={videoRef}
          className="w-full rounded-lg"
          controls
          autoPlay
          loop
          muted
        >
          Your browser does not support the video element.
        </video>
      </div>
    </div>
  );
};