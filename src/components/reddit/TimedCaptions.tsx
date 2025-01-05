import { useEffect, useState } from "react";

interface TimedCaptionsProps {
  captions: string;
  audioRef: React.RefObject<HTMLAudioElement>;
  className?: string;
}

export const TimedCaptions = ({ captions, audioRef, className = "" }: TimedCaptionsProps) => {
  const [currentCaption, setCurrentCaption] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  // Split into smaller chunks of 4-5 words
  const chunks = captions
    .split(/[.!?]+/)
    .flatMap(sentence => 
      sentence
        .trim()
        .split(/\s+/)
        .reduce((acc: string[], word, i) => {
          const chunkIndex = Math.floor(i / 4);
          if (!acc[chunkIndex]) acc[chunkIndex] = word;
          else acc[chunkIndex] += ` ${word}`;
          return acc;
        }, [])
    )
    .filter(Boolean);

  useEffect(() => {
    if (!audioRef.current || chunks.length === 0) {
      console.log('No audio reference or chunks available');
      return;
    }

    const audio = audioRef.current;
    let currentIndex = -1;
    let lastUpdateTime = 0;

    const handleTimeUpdate = () => {
      if (!audio.duration) return;

      const now = Date.now();
      // Only update every 100ms to prevent too frequent updates
      if (now - lastUpdateTime < 100) return;
      lastUpdateTime = now;

      // Calculate chunk duration based on total audio duration
      const chunkDuration = audio.duration / chunks.length;
      const newIndex = Math.floor(audio.currentTime / chunkDuration);

      // Only update if moving to a new chunk and it's valid
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < chunks.length) {
        console.log('Updating caption:', {
          newIndex,
          currentTime: audio.currentTime,
          chunk: chunks[newIndex],
          chunkDuration,
          totalChunks: chunks.length,
          audioDuration: audio.duration
        });
        
        currentIndex = newIndex;
        setCurrentCaption(chunks[newIndex]);
        setIsVisible(true);
      }
    };

    const handlePlay = () => {
      console.log('Audio started playing');
      setIsVisible(true);
      // Start with first caption
      setCurrentCaption(chunks[0]);
      currentIndex = 0;
    };

    const handlePause = () => {
      console.log('Audio paused');
      setIsVisible(true);
    };

    const handleEnded = () => {
      console.log('Audio ended');
      currentIndex = -1;
      setIsVisible(false);
    };

    // Add all event listeners
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    // Cleanup function
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioRef, chunks]);

  if (!currentCaption) {
    return null;
  }

  return (
    <div className="flex justify-center items-center w-full">
      <div 
        className={`transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'} ${className}`}
      >
        <p className="text-center max-w-3xl mx-auto">
          {currentCaption}
        </p>
      </div>
    </div>
  );
};