import { Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Message } from "./types";
import { MessageBubble } from "./MessageBubble";
import { useEffect, useRef } from "react";
import html2canvas from "html2canvas";

interface ConversationPreviewProps {
  messages: Message[];
  onExport: () => Promise<void>;
  exporting: boolean;
}

export const ConversationPreview = ({ messages, onExport, exporting }: ConversationPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!messages.length || !containerRef.current) return;

    const createVideoPreview = async () => {
      // Convert the div to a canvas
      const canvas = await html2canvas(containerRef.current!);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Create a media stream from the canvas
      const stream = canvas.captureStream(30); // 30 FPS
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

      // Animate the messages (simple fade-in effect)
      let currentFrame = 0;
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(containerRef.current!, 0, 0);
        currentFrame++;
        
        if (currentFrame < 150) { // 5 seconds at 30 FPS
          requestAnimationFrame(animate);
        } else {
          mediaRecorder.stop();
        }
      };

      // Start recording and animation
      mediaRecorder.start();
      animate();
    };

    createVideoPreview();
  }, [messages]);

  if (!messages.length) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Preview</h3>
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

      <div className="space-y-4">
        <div 
          ref={containerRef}
          className="bg-[#F5F5F5] rounded-lg p-4 space-y-4 border border-accent"
        >
          <div className="text-center text-sm text-gray-500 pb-2">
            Today
          </div>
          {messages.map((message, index) => (
            <MessageBubble
              key={index}
              message={message.content}
              isUser={message.isUser}
              timestamp={message.timestamp}
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