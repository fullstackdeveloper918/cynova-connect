import { useEffect, useState } from "react";

interface TimedCaptionsProps {
  captions: string;
  audioRef: React.RefObject<HTMLAudioElement>;
  className?: string;
}

export const TimedCaptions = ({ captions, audioRef, className = "" }: TimedCaptionsProps) => {
  const [currentCaption, setCurrentCaption] = useState("");
  const [captionIndex, setCaptionIndex] = useState(0);

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
      }
    };

    const handlePlay = () => {
      console.log('Audio started playing, setting initial caption');
      // Set initial caption
      if (sentences.length > 0) {
        setCurrentCaption(sentences[0]);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
    };
  }, [audioRef, sentences, captionIndex]);

  return (
    <div className={`transition-opacity duration-300 ${className}`}>
      {currentCaption && (
        <p className="animate-fade-in text-center">
          {currentCaption}
        </p>
      )}
    </div>
  );
};