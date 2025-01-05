import { RefObject, useEffect, useRef } from "react";

interface VideoContentProps {
  previewUrl: string;
  audioUrl?: string;
  audioRef: RefObject<HTMLAudioElement>;
}

export const VideoContent = ({ previewUrl, audioUrl, audioRef }: VideoContentProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (audioRef.current && audioUrl) {
      console.log('Setting up audio playback with:', { audioUrl });
      
      const audio = audioRef.current;
      audio.currentTime = 0;
      audio.src = audioUrl;

      const handleEnded = () => {
        console.log('Audio ended');
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
        }
      };

      audio.addEventListener('ended', handleEnded);
      
      // Start playback
      Promise.all([
        audio.play(),
        videoRef.current?.play()
      ]).catch(error => {
        console.error('Playback error:', error);
      });
      
      return () => {
        audio.removeEventListener('ended', handleEnded);
        audio.pause();
        audio.src = '';
      };
    }
  }, [audioUrl, audioRef]);

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        src={previewUrl}
        className="w-full h-full object-cover"
        loop
        muted
        playsInline
        autoPlay
      />
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