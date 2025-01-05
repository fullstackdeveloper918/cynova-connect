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
    if (!audioRef.current) return;

    // Reset when audio source changes
    setCaptionIndex(0);
    setCurrentCaption("");

    const audio = audioRef.current;
    
    const handleTimeUpdate = () => {
      if (!audio.duration) return;
      
      const timePerSentence = audio.duration / sentences.length;
      const currentTime = audio.currentTime;
      const index = Math.floor(currentTime / timePerSentence);
      
      if (index !== captionIndex && index < sentences.length) {
        console.log('Updating caption to:', sentences[index]);
        setCaptionIndex(index);
        setCurrentCaption(sentences[index]);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
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