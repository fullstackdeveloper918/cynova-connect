import { Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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

  // Split script into sentences for captions
  const sentences = script?.split(/[.!?]+/).filter(Boolean).map(s => s.trim()) || [];
  const sentenceDuration = audioRef.current ? audioRef.current.duration / sentences.length : 0;

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
        const sentenceIndex = Math.floor(time / sentenceDuration);
        if (sentences[sentenceIndex]) {
          setCurrentCaption(sentences[sentenceIndex]);
        }
      };

      const interval = setInterval(updateCaption, 100);
      return () => clearInterval(interval);
    }
  }, [isPlaying, sentences, sentenceDuration]);

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
      <div className="aspect-video rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50">
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
        className="w-full aspect-video rounded-lg bg-gray-50 overflow-hidden relative cursor-pointer group"
        onClick={handlePlayPause}
      >
        {previewUrl ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30 flex items-center justify-center">
              <div className="text-white text-lg p-6 text-center max-w-lg">
                {currentCaption || sentences[0]}
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