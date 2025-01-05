import { RefObject, useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

interface VideoContentProps {
  previewUrl: string;
  audioUrl?: string;
  audioRef: RefObject<HTMLAudioElement>;
}

export const VideoContent = ({ previewUrl, audioUrl, audioRef }: VideoContentProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (audioRef.current && audioUrl) {
      console.log('Setting up audio playback with:', { audioUrl });
      
      const audio = audioRef.current;
      audio.currentTime = 0;
      audio.src = audioUrl;

      const handleEnded = () => {
        console.log('Audio ended');
        setIsPlaying(false);
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
        }
      };

      audio.addEventListener('ended', handleEnded);
      
      return () => {
        audio.removeEventListener('ended', handleEnded);
        audio.pause();
        audio.src = '';
      };
    }
  }, [audioUrl, audioRef]);

  const togglePlayback = async () => {
    if (!audioRef.current || !videoRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        videoRef.current.pause();
      } else {
        videoRef.current.currentTime = audioRef.current.currentTime;
        await Promise.all([
          audioRef.current.play(),
          videoRef.current.play()
        ]);
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Playback error:', error);
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
      <button
        onClick={togglePlayback}
        className="absolute inset-0 m-auto w-16 h-16 flex items-center justify-center bg-black/50 rounded-full hover:bg-black/70 transition-colors"
      >
        {isPlaying ? (
          <Pause className="w-8 h-8 text-white" />
        ) : (
          <Play className="w-8 h-8 text-white ml-1" />
        )}
      </button>
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          className="hidden"
        />
      )}
    </div>
  );
};