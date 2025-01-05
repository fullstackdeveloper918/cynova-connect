import { useEffect, useState } from "react";

interface TimedCaptionsProps {
  captions: string;
  audioRef: React.RefObject<HTMLAudioElement>;
  className?: string;
}

export const TimedCaptions = ({ captions, audioRef, className = "" }: TimedCaptionsProps) => {
  const [currentCaption, setCurrentCaption] = useState("");
  const [captionIndex, setCaptionIndex] = useState(0);
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
      console.log('No audio reference or chunks available for captions');
      return;
    }

    // Reset when audio source changes
    setCaptionIndex(0);
    setCurrentCaption(chunks[0]);
    setIsVisible(true);

    const audio = audioRef.current;
    let lastIndex = -1;  // Track last displayed index to prevent duplicate updates
    
    const handleTimeUpdate = () => {
      if (!audio.duration) return;
      
      // Calculate time per chunk based on audio duration
      const timePerChunk = audio.duration / chunks.length;
      const currentTime = audio.currentTime;
      const index = Math.floor(currentTime / timePerChunk);
      
      // Only update if index has changed and is valid
      if (index !== lastIndex && index >= 0 && index < chunks.length) {
        console.log('Updating caption:', {
          index,
          chunk: chunks[index],
          currentTime,
          timePerChunk,
          audioDuration: audio.duration
        });
        lastIndex = index;
        setCaptionIndex(index);
        setCurrentCaption(chunks[index]);
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
      setIsVisible(true);
      lastIndex = -1; // Reset last index when audio ends
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    
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