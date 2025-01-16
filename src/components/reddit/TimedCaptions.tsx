import { useEffect, useState } from "react";

interface TimedCaptionsProps {
  captions: string;
  audioRef: React.RefObject<HTMLAudioElement>;
  className?: string;
}

export const TimedCaptions = ({ captions, audioRef, className = "" }: TimedCaptionsProps) => {
  const [currentCaption, setCurrentCaption] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isShowingTitle, setIsShowingTitle] = useState(true);

  // Split content into title and comments
  const [title, ...comments] = captions.split('\n\n');
  const commentsText = comments.join('\n\n');

  // Split comments into sentences for better timing
  const sentences = commentsText
    .split(/[.!?]+\s*/)
    .map(sentence => sentence.trim())
    .filter(Boolean);

  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    let lastUpdateTime = 0;
    let animationFrameId: number;

    const updateCaption = () => {
      const now = Date.now();
      if (now - lastUpdateTime < 50) {
        animationFrameId = requestAnimationFrame(updateCaption);
        return;
      }
      lastUpdateTime = now;

      const isTitleAudio = audio.src.includes('title');
      const progress = audio.currentTime / audio.duration;

      if (isTitleAudio) {
        setCurrentCaption(title);
        setIsShowingTitle(true);
      } else {
        const sentenceIndex = Math.floor(progress * sentences.length);
        if (sentenceIndex >= 0 && sentenceIndex < sentences.length) {
          setCurrentCaption(sentences[sentenceIndex]);
        }
        setIsShowingTitle(false);
      }
      setIsVisible(true);
      
      if (audio.paused) {
        cancelAnimationFrame(animationFrameId);
      } else {
        animationFrameId = requestAnimationFrame(updateCaption);
      }
    };

    const handlePlay = () => {
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

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      cancelAnimationFrame(animationFrameId);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
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