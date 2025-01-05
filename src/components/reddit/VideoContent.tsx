import { RefObject, useEffect, useState, useRef } from "react";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoContentProps {
  previewUrl: string;
  audioUrl?: string;
  audioRef: RefObject<HTMLAudioElement>;
}

export const VideoContent = ({ previewUrl, audioUrl, audioRef }: VideoContentProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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

          if (isPlaying && videoRef.current) {
            console.log('Starting synchronized playback');
            await Promise.all([
              audio.play(),
              videoRef.current.play()
            ]);
            console.log('Synchronized playback started successfully');
          }
        } catch (error) {
          console.error('Audio playback error:', error);
          setIsPlaying(false);
        }
      };

      startPlayback();

      const handleEnded = () => {
        console.log('Audio ended, restarting');
        audio.currentTime = 0;
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
        }
        setIsPlaying(false);
      };

      audio.addEventListener('ended', handleEnded);
      
      return () => {
        audio.removeEventListener('ended', handleEnded);
        audio.pause();
        audio.src = '';
        setIsPlaying(false);
      };
    }
  }, [audioUrl, audioRef, isPlaying]);

  const togglePlayback = async () => {
    if (!audioRef.current || !videoRef.current) return;

    try {
      if (isPlaying) {
        console.log('Pausing playback');
        audioRef.current.pause();
        videoRef.current.pause();
      } else {
        console.log('Starting playback');
        // Reset positions
        audioRef.current.currentTime = 0;
        videoRef.current.currentTime = 0;
        
        // Start both simultaneously
        await Promise.all([
          audioRef.current.play(),
          videoRef.current.play()
        ]);
      }
      setIsPlaying(!isPlaying);
      console.log('Playback state toggled:', !isPlaying);
    } catch (error) {
      console.error('Playback toggle error:', error);
      setIsPlaying(false);
    }
  };

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        src={previewUrl}
        className="w-full h-full object-cover"
        loop
        muted
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