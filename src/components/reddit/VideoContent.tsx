import { RefObject, useEffect } from "react";

interface VideoContentProps {
  previewUrl: string;
  audioUrl?: string;
  audioRef: RefObject<HTMLAudioElement>;
}

export const VideoContent = ({ audioUrl, audioRef }: VideoContentProps) => {
  useEffect(() => {
    if (audioRef.current && audioUrl) {
      console.log('Setting up audio playback with:', { audioUrl });
      
      const audio = audioRef.current;

      // Reset when sources change
      audio.currentTime = 0;

      const startPlayback = async () => {
        try {
          // Set audio source
          audio.src = audioUrl;
          console.log('Audio source set:', audioUrl);

          // Wait for audio to load
          await new Promise((resolve) => {
            audio.addEventListener('loadeddata', resolve, { once: true });
          });

          console.log('Audio loaded, starting playback');
          
          // Start playback
          await audio.play();
          console.log('Audio playback started successfully');
        } catch (error) {
          console.error('Audio playback error:', error);
        }
      };

      // Start playback immediately
      startPlayback();

      // Handle audio ending
      const handleEnded = () => {
        console.log('Audio ended, restarting');
        audio.currentTime = 0;
        startPlayback();
      };

      audio.addEventListener('ended', handleEnded);
      
      return () => {
        audio.removeEventListener('ended', handleEnded);
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