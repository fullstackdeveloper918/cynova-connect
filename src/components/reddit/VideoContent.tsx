import { RefObject, useEffect, useRef, useState } from "react";

interface VideoContentProps {
  previewUrl: string;
  audioUrl?: string;
  audioRef: RefObject<HTMLAudioElement>;
}

export const VideoContent = ({ previewUrl, audioUrl, audioRef }: VideoContentProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (videoRef.current && audioRef.current && previewUrl) {
      console.log('Setting up media elements with:', { previewUrl, audioUrl });
      
      const video = videoRef.current;
      const audio = audioRef.current;

      // Reset when sources change
      video.currentTime = 0;
      audio.currentTime = 0;
      setIsPlaying(false);

      const startPlayback = async () => {
        try {
          // Set audio source if provided
          if (audioUrl) {
            audio.src = audioUrl;
          }

          // Wait for both video and audio to load
          await Promise.all([
            new Promise((resolve) => {
              video.addEventListener('loadeddata', resolve, { once: true });
            }),
            audioUrl
              ? new Promise((resolve) => {
                  audio.addEventListener('loadeddata', resolve, { once: true });
                })
              : Promise.resolve(),
          ]);

          console.log('Both video and audio loaded, starting playback');
          setIsPlaying(true);
          
          // Start playback
          await Promise.all([
            video.play(),
            audioUrl ? audio.play() : Promise.resolve()
          ]);
        } catch (error) {
          console.error('Playback error:', error);
          setIsPlaying(false);
        }
      };

      // Start playback immediately
      startPlayback();

      // Sync audio with video
      const handleTimeUpdate = () => {
        if (Math.abs(video.currentTime - audio.currentTime) > 0.1) {
          console.log('Syncing audio time:', video.currentTime);
          audio.currentTime = video.currentTime;
        }
      };

      // Handle video ending
      const handleEnded = () => {
        console.log('Video ended, restarting');
        video.currentTime = 0;
        if (audioUrl) audio.currentTime = 0;
        startPlayback();
      };

      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('ended', handleEnded);
      
      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('ended', handleEnded);
        setIsPlaying(false);
      };
    }
  }, [previewUrl, audioUrl, audioRef]);

  return (
    <>
      <video
        ref={videoRef}
        src={previewUrl}
        loop
        playsInline
        muted={!audioUrl}
        className="w-full h-full object-cover"
      >
        Your browser does not support the video tag.
      </video>
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          loop
          className="hidden"
        />
      )}
    </>
  );
};