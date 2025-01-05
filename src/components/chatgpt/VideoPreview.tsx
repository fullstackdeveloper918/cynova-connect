import { Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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

  // Split script into sentences and then into smaller chunks
  const sentences = script?.split(/[.!?]+/).filter(Boolean).map(s => s.trim()) || [];
  const captionChunks = sentences.flatMap(sentence => 
    sentence
      .split(/\s+/)
      .reduce((chunks: string[], word, i) => {
        const chunkIndex = Math.floor(i / 4); // 4 words per chunk
        if (!chunks[chunkIndex]) chunks[chunkIndex] = word;
        else chunks[chunkIndex] += ` ${word}`;
        return chunks;
      }, [])
  );
  
  const chunkDuration = audioRef.current ? audioRef.current.duration / captionChunks.length : 0;

  useEffect(() => {
    if (script && !frameUrls.length) {
      const generateFrames = async () => {
        setIsLoading(true);
        try {
          // Calculate number of frames based on audio duration (1 frame per 10 seconds)
          const audioDuration = audioRef.current?.duration || 30; // default to 30 if not loaded
          const numberOfFrames = Math.max(1, Math.ceil(audioDuration / 10));
          
          console.log('Starting frame generation for script:', script);
          console.log('Generating frames:', numberOfFrames);
          
          const { data, error } = await supabase.functions.invoke("generate-video-frames", {
            body: { 
              script,
              numberOfFrames // Pass the calculated number of frames
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
        
        // Update current caption chunk based on time
        const chunkIndex = Math.floor(time / chunkDuration);
        if (captionChunks[chunkIndex]) {
          setCurrentCaption(captionChunks[chunkIndex]);
        }

        // Update current frame based on time progress (1 frame per 10 seconds)
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
  }, [isPlaying, captionChunks, chunkDuration, frameUrls.length]);

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
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : frameUrls.length > 0 ? (
              <img
                src={frameUrls[currentFrameIndex]}
                alt={`Frame ${currentFrameIndex + 1}`}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-muted-foreground">Generating frames...</p>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30 flex items-center justify-center">
              <div className="text-white text-lg p-6 text-center max-w-lg">
                {currentCaption || captionChunks[0]}
              </div>
            </div>
            <audio
              ref={audioRef}
              src={previewUrl.audioUrl}
              className="hidden"
              onEnded={handleAudioEnded}
            />
            <div className="absolute bottom-4 left-4 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full">
              {isPlaying ? 'Click to pause' : 'Click to play'}
            </div>
            {/* Progress bar */}
            {audioRef.current && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
                <div 
                  className="h-full bg-primary transition-all duration-100"
                  style={{ 
                    width: `${(currentTime / audioRef.current.duration) * 100}%` 
                  }}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center space-y-2 text-muted-foreground h-full flex items-center justify-center">
            <Video className="mx-auto h-12 w-12 animate-pulse" />
            <p>Click preview to generate your video</p>
          </div>
        )}
      </div>
    </div>
  );
};