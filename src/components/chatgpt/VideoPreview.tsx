import { Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FrameDisplay } from "./video-preview/FrameDisplay";
import { EmptyState } from "./video-preview/EmptyState";

interface PreviewUrls {
  videoUrl: string;
  audioUrl: string;
}

interface VideoPreviewProps {
  script: string;
  previewUrl: PreviewUrls | null;
  selectedVoice: string;
}

export const VideoPreview = ({
  script,
  previewUrl,
  selectedVoice,
}: VideoPreviewProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentCaption, setCurrentCaption] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [frameUrls, setFrameUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Split script into sentences for more natural caption breaks
  const sentences = script?.split(/[.!?]+/).filter(Boolean).map(s => s.trim()) || [];
  
  useEffect(() => {
    if (script && !frameUrls.length) {
      const generateFrames = async () => {
        setIsLoading(true);
        try {
          const audioDuration = audioRef.current?.duration || 30;
          const numberOfFrames = Math.max(1, Math.ceil(audioDuration / 10));
          
          console.log('Starting frame generation for script:', script);
          console.log('Generating frames:', numberOfFrames);
          
          const { data, error } = await supabase.functions.invoke("generate-video-frames", {
            body: { 
              script,
              numberOfFrames
            }
          });

          if (error) {
            console.error('Error from generate-video-frames:', error);
            throw error;
          }

          if (data.frameUrls) {
            console.log('Received frame URLs:', data.frameUrls);
            setFrameUrls(data.frameUrls);
          }
        } catch (error) {
          console.error('Error generating frames:', error);
        } finally {
          setIsLoading(false);
        }
      };

      generateFrames();
    }
  }, [script]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [previewUrl]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      const updateCaption = () => {
        const time = audioRef.current?.currentTime || 0;
        setCurrentTime(time);
        
        // Calculate which sentence should be shown based on current time
        const audioDuration = audioRef.current?.duration || 0;
        if (audioDuration > 0) {
          const sentenceIndex = Math.min(
            Math.floor((time / audioDuration) * sentences.length),
            sentences.length - 1
          );
          setCurrentCaption(sentences[sentenceIndex]);
        }

        // Update frame index
        if (frameUrls.length > 0) {
          const frameIndex = Math.min(
            Math.floor(time / 10),
            frameUrls.length - 1
          );
          console.log('Updating frame index:', frameIndex, 'Time:', time);
          setCurrentFrameIndex(frameIndex);
        }
      };

      const interval = setInterval(updateCaption, 100);
      return () => clearInterval(interval);
    }
  }, [isPlaying, sentences, frameUrls.length]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  if (!script) {
    return (
      <div className="aspect-[9/16] w-full max-w-[450px] mx-auto rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-2 text-muted-foreground">
          <Video className="mx-auto h-12 w-12" />
          <p>Generate a script to preview your video</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div 
        className="aspect-[9/16] w-full max-w-[450px] mx-auto rounded-lg bg-gray-50 overflow-hidden relative cursor-pointer group"
        onClick={handlePlayPause}
      >
        {previewUrl ? (
          <>
            <FrameDisplay
              isLoading={isLoading}
              frameUrls={frameUrls}
              currentFrameIndex={currentFrameIndex}
              currentCaption={currentCaption || sentences[0]}
              isPlaying={isPlaying}
              audioRef={audioRef}
              currentTime={currentTime}
              onClick={handlePlayPause}
            />
            <audio
              ref={audioRef}
              src={previewUrl.audioUrl}
              className="hidden"
              onEnded={handleAudioEnded}
            />
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};