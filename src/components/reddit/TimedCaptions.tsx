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
  const commentSentences = commentsText
    .split(/[.!?]+/)
    .map(sentence => sentence.trim())
    .filter(Boolean);

  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    let lastUpdateTime = 0;

    const updateCaption = () => {
      const now = Date.now();
      if (now - lastUpdateTime < 50) return; // Throttle updates
      lastUpdateTime = now;

      const progress = audio.currentTime / audio.duration;
      const isTitleAudio = audio.src.includes('title');

      if (isTitleAudio) {
        // For title audio, show the title text
        setCurrentCaption(title);
        setIsShowingTitle(true);
      } else {
        // For comments audio, calculate which sentence to show based on progress
        const sentenceIndex = Math.floor(progress * commentSentences.length);
        if (sentenceIndex >= 0 && sentenceIndex < commentSentences.length) {
          setCurrentCaption(commentSentences[sentenceIndex]);
        }
        setIsShowingTitle(false);
      }
      setIsVisible(true);
    };

    const handleTimeUpdate = () => {
      if (!audio.duration) return;
      updateCaption();
    };

    const handlePlay = () => {
      const isTitleAudio = audio.src.includes('title');
      setIsShowingTitle(isTitleAudio);
      updateCaption();
      setIsVisible(true);
    };

    const handlePause = () => {
      setIsVisible(true);
    };

    const handleEnded = () => {
      setIsVisible(false);
      if (isShowingTitle) {
        setIsShowingTitle(false);
      }
    };

    // Add event listeners
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    // Cleanup
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioRef, title, commentSentences, isShowingTitle]);

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div 
        className={`transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'} ${className}`}
      >
        <p className="text-center max-w-3xl mx-auto px-4">
          {currentCaption}
        </p>
      </div>
    </div>
  );
};