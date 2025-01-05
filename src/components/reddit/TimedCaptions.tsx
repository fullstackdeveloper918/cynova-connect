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

    const handleTimeUpdate = () => {
      if (!audio.duration) return;

      // Calculate which chunk should be showing based on current time
      const timePerChunk = audio.duration / chunks.length;
      const newIndex = Math.floor(audio.currentTime / timePerChunk);

      // Only update if we're moving to a new chunk and it's valid
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < chunks.length) {
        console.log('Updating caption:', {
          newIndex,
          currentTime: audio.currentTime,
          chunk: chunks[newIndex],
          timePerChunk,
          totalChunks: chunks.length
        });
        
        currentIndex = newIndex;
        setCurrentCaption(chunks[newIndex]);
        setIsVisible(true);
      }
    };

    const handlePlay = () => {
      console.log('Audio started playing');
      setIsVisible(true);
    };

    const handlePause = () => {
      console.log('Audio paused');
      setIsVisible(true);
    };

    const handleEnded = () => {
      console.log('Audio ended');
      currentIndex = -1; // Reset for next playback
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
  }, [audioRef, chunks]); // Only re-run if audio ref or chunks change

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