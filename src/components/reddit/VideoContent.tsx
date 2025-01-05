import { RefObject, useEffect, useState } from "react";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoContentProps {
  previewUrl: string;
  audioUrl?: string;
  audioRef: RefObject<HTMLAudioElement>;
}

export const VideoContent = ({ previewUrl, audioUrl, audioRef }: VideoContentProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (audioRef.current && audioUrl) {
      console.log('Setting up audio playback with:', { audioUrl });
      
      const audio = audioRef.current;
      audio.currentTime = 0;

      const startPlayback = async () => {
        try {
          audio.src = audioUrl;
          console.log('Audio source set:', audioUrl);

          // Wait for audio to load
          await new Promise((resolve) => {
            audio.addEventListener('loadeddata', resolve, { once: true });
          });

          if (isPlaying) {
            console.log('Audio loaded, starting playback');
            await audio.play();
            console.log('Audio playback started successfully');
          }
        } catch (error) {
          console.error('Audio playback error:', error);
        }
      };

      startPlayback();

      const handleEnded = () => {
        console.log('Audio ended, restarting');
        audio.currentTime = 0;
        startPlayback();
      };

      audio.addEventListener('ended', handleEnded);
      
      return () => {
        audio.removeEventListener('ended', handleEnded);
        audio.pause();
        audio.src = '';
      };
    }
  }, [audioUrl, audioRef, isPlaying]);

  const togglePlayback = async () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        try {
          await audioRef.current.play();
        } catch (error) {
          console.error('Playback error:', error);
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="relative w-full h-full">
      <video
        src={previewUrl}
        className="w-full h-full object-cover"
        loop
        muted
        autoPlay={isPlaying}
        playsInline
      />
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          className="hidden"
        />
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <Button
          variant="outline"
          size="icon"
          className="w-16 h-16 rounded-full bg-black/50 hover:bg-black/70 border-2 border-white/50"
          onClick={togglePlayback}
        >
          {isPlaying ? (
            <Pause className="h-8 w-8 text-white" />
          ) : (
            <Play className="h-8 w-8 text-white ml-1" />
          )}
        </Button>
      </div>
    </div>
  );
};