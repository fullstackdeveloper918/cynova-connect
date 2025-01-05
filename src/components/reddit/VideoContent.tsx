import { RefObject, useEffect } from "react";

interface VideoContentProps {
  previewUrl: string;
  audioUrl?: string;
  audioRef: RefObject<HTMLAudioElement>;
}

export const VideoContent = ({ previewUrl, audioUrl, audioRef }: VideoContentProps) => {
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

          console.log('Audio loaded, starting playback');
          await audio.play();
          console.log('Audio playback started successfully');
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
  }, [audioUrl, audioRef]);

  return (
    <>
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          className="hidden"
        />
      )}
    </>
  );
};