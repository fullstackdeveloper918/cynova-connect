import { useEffect, useState, useRef } from "react";

interface TimedCaptionsProps {
  captions: string;
  audioRef: React.RefObject<HTMLAudioElement>;
  className?: string;
}

export const TimedCaptions = ({ captions, audioRef, className = "" }: TimedCaptionsProps) => {
  const [currentCaption, setCurrentCaption] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isShowingTitle, setIsShowingTitle] = useState(true);
  const lastUpdateTimeRef = useRef(0);

  // Split content into title and comments
  const [title, ...comments] = captions.split('\n\n');
  const commentsText = comments.join('\n\n');

  // Split comments into sentences for better timing
  const sentences = commentsText
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(Boolean);

  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    let animationFrameId: number;

    const updateCaption = () => {
      const now = Date.now();
      // Update every 50ms for smoother transitions
      if (now - lastUpdateTimeRef.current < 50) {
        animationFrameId = requestAnimationFrame(updateCaption);
        return;
      }
      lastUpdateTimeRef.current = now;

      const isTitleAudio = audio.src.includes('title');
      const duration = audio.duration || 1;
      const currentTime = audio.currentTime;
      const progress = currentTime / duration;

      if (isTitleAudio) {
        // For title audio, show the entire title
        setCurrentCaption(title);
        setIsShowingTitle(true);
      } else {
        // For comments, calculate which sentence to show based on progress
        const sentenceIndex = Math.min(
          Math.floor(progress * sentences.length),
          sentences.length - 1
        );
        
        // Ensure we're showing the correct sentence
        if (sentenceIndex >= 0 && sentenceIndex < sentences.length) {
          setCurrentCaption(sentences[sentenceIndex]);
        }
        setIsShowingTitle(false);
      }
      
      setIsVisible(true);

      if (!audio.paused) {
        animationFrameId = requestAnimationFrame(updateCaption);
      }
    };

    const handlePlay = () => {
      lastUpdateTimeRef.current = 0; // Reset timing on play
      setIsShowingTitle(audio.src.includes('title'));
      updateCaption();
    };

    const handlePause = () => {
      cancelAnimationFrame(animationFrameId);
      setIsVisible(true);
    };

    const handleEnded = () => {
      cancelAnimationFrame(animationFrameId);
      setIsVisible(false);
      if (isShowingTitle) {
        setIsShowingTitle(false);
      }
    };

    const handleTimeUpdate = () => {
      // Update caption immediately on time change
      updateCaption();
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [audioRef, title, sentences, isShowingTitle]);

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div 
        className={`transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'} ${className}`}
      >
        <p className="text-center max-w-3xl mx-auto px-4 text-xl font-medium">
          {currentCaption}
        </p>
      </div>
    </div>
  );
};