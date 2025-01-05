import { useEffect, useRef, useState } from "react";

interface VideoContentProps {
  previewUrl: string;
  audioUrl?: string;
}

export const VideoContent = ({ previewUrl, audioUrl }: VideoContentProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (videoRef.current && audioRef.current && previewUrl) {
      console.log('Setting up media elements...');
      
      const video = videoRef.current;
      const audio = audioRef.current;

      // Reset when sources change
      video.currentTime = 0;
      audio.currentTime = 0;

      const startPlayback = async () => {
        try {
          setIsPlaying(true);
          await Promise.all([
            video.play(),
            audio.play()
          ]);
          console.log('Playback started successfully');
        } catch (error) {
          console.error('Playback error:', error);
          setIsPlaying(false);
        }
      };

      // Sync audio with video
      const handleTimeUpdate = () => {
        if (Math.abs(video.currentTime - audio.currentTime) > 0.1) {
          audio.currentTime = video.currentTime;
        }
      };

      // Handle video ending
      const handleEnded = () => {
        video.currentTime = 0;
        audio.currentTime = 0;
        startPlayback();
      };

      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('ended', handleEnded);
      
      // Start playback when both video and audio are loaded
      let videoLoaded = false;
      let audioLoaded = false;

      video.addEventListener('loadeddata', () => {
        console.log('Video loaded');
        videoLoaded = true;
        if (audioLoaded) startPlayback();
      });

      audio.addEventListener('loadeddata', () => {
        console.log('Audio loaded');
        audioLoaded = true;
        if (videoLoaded) startPlayback();
      });

      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('ended', handleEnded);
        setIsPlaying(false);
      };
    }
  }, [previewUrl, audioUrl]);

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