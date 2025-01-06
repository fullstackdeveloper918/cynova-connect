import { Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FrameDisplay } from "./video-preview/FrameDisplay";
import { EmptyState } from "./video-preview/EmptyState";

interface PreviewUrls {
  videoUrl?: string;
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

  // Split script into smaller chunks for better readability and timing
  const words = script?.split(/\s+/) || [];
  const WORDS_PER_CHUNK = 4;
  const captionChunks = words.reduce((chunks: string[], word, index) => {
    const chunkIndex = Math.floor(index / WORDS_PER_CHUNK);
    if (!chunks[chunkIndex]) {
      chunks[chunkIndex] = word;
    } else {
      chunks[chunkIndex] += ` ${word}`;
    }
    return chunks;
  }, []);
  
  useEffect(() => {
    if (script && !frameUrls.length) {
      const generateFrames = async () => {
        setIsLoading(true);
        try {
          const audioDuration = audioRef.current?.duration || 30;
          // Reduce number of frames to 2 (one for each option) for faster generation
          const numberOfFrames = 2;
          
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
            // Duplicate frames to maintain smooth transitions
            const duplicatedFrames = data.frameUrls.reduce((acc: string[], frame: string) => {
              // Duplicate each frame 3 times for smoother transitions
              return [...acc, frame, frame, frame];
            }, []);
            setFrameUrls(duplicatedFrames);
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
        const duration = audioRef.current?.duration || 1;
        setCurrentTime(time);
        
        // Calculate which chunk should be shown based on current time
        // Using duration to evenly space captions throughout the video
        const progress = time / duration;
        const chunkIndex = Math.min(
          Math.floor(progress * captionChunks.length),
          captionChunks.length - 1
        );
        
        setCurrentCaption(captionChunks[chunkIndex]);

        // Update frame index based on time intervals
        if (frameUrls.length > 0) {
          const frameInterval = duration / frameUrls.length;
          const frameIndex = Math.min(
            Math.floor(time / frameInterval),
            frameUrls.length - 1
          );
          setCurrentFrameIndex(frameIndex);
        }
      };

      // Update more frequently for smoother transitions
      const interval = setInterval(updateCaption, 50);
      return () => clearInterval(interval);
    }
  }, [isPlaying, captionChunks, frameUrls.length]);

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
    return <EmptyState />;
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
              currentCaption={currentCaption || captionChunks[0]}
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