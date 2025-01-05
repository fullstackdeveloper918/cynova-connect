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

  // Split captions into sentences
  const sentences = captions.split(/[.!?]+/).filter(Boolean).map(s => s.trim());

  useEffect(() => {
    if (!audioRef.current) {
      console.log('No audio reference available for captions');
      return;
    }

    // Reset when audio source changes
    setCaptionIndex(0);
    setCurrentCaption("");
    setIsVisible(false);

    const audio = audioRef.current;
    
    const handleTimeUpdate = () => {
      if (!audio.duration) {
        console.log('Audio duration not available yet');
        return;
      }
      
      // Calculate time per sentence based on audio duration
      const timePerSentence = audio.duration / sentences.length;
      const currentTime = audio.currentTime;
      const index = Math.floor(currentTime / timePerSentence);
      
      if (index !== captionIndex && index < sentences.length) {
        console.log('Updating caption:', {
          index,
          sentence: sentences[index],
          currentTime,
          timePerSentence,
          audioDuration: audio.duration
        });
        setCaptionIndex(index);
        setCurrentCaption(sentences[index]);
        setIsVisible(true);
      }
    };

    const handlePlay = () => {
      console.log('Audio started playing, setting initial caption');
      // Set initial caption
      if (sentences.length > 0) {
        setCurrentCaption(sentences[0]);
        setIsVisible(true);
      }
    };

    const handlePause = () => {
      console.log('Audio paused');
      setIsVisible(false);
    };

    const handleEnded = () => {
      console.log('Audio ended');
      setIsVisible(false);
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
  }, [audioRef, sentences, captionIndex]);

  if (!isVisible || !currentCaption) {
    return null;
  }

  return (
    <div className="flex justify-center items-center w-full">
      <div className={`transition-all duration-300 ease-in-out transform ${className}`}>
        <p className="animate-fade-in text-center max-w-3xl mx-auto">
          {currentCaption}
        </p>
      </div>
    </div>
  );
};