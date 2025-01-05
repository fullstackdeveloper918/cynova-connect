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

  // Split title into smaller chunks (2-3 words for better timing)
  const titleChunks = title
    .trim()
    .split(/\s+/)
    .reduce((acc: string[], word, i) => {
      const chunkIndex = Math.floor(i / 3);
      if (!acc[chunkIndex]) acc[chunkIndex] = word;
      else acc[chunkIndex] += ` ${word}`;
      return acc;
    }, []);

  // Split comments into chunks
  const commentChunks = commentsText
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
    if (!audioRef.current) return;

    const audio = audioRef.current;
    let lastUpdateTime = 0;

    const updateCaption = (progress: number, isTitleSection: boolean) => {
      const chunks = isTitleSection ? titleChunks : commentChunks;
      const index = Math.floor(progress * chunks.length);
      
      if (index >= 0 && index < chunks.length) {
        const chunk = chunks[index];
        setCurrentCaption(chunk);
        setIsVisible(true);
        setIsShowingTitle(isTitleSection);
      }
    };

    const handleTimeUpdate = () => {
      if (!audio.duration) return;

      const now = Date.now();
      if (now - lastUpdateTime < 100) return; // Throttle updates
      lastUpdateTime = now;

      const isTitleAudio = audio.src.includes('title');
      if (!isTitleAudio && isShowingTitle) {
        // If we're showing title but playing comment audio, hide title
        setIsVisible(false);
        setIsShowingTitle(false);
        return;
      }

      const progress = audio.currentTime / audio.duration;
      updateCaption(progress, isTitleAudio);
    };

    const handlePlay = () => {
      const isTitleAudio = audio.src.includes('title');
      if (isTitleAudio) {
        setIsShowingTitle(true);
        updateCaption(0, true);
      } else {
        setIsShowingTitle(false);
        updateCaption(0, false);
      }
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
  }, [audioRef, titleChunks, commentChunks, isShowingTitle]);

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div 
        className={`transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'} ${className}`}
      >
        {isShowingTitle ? (
          <h1 className="text-center max-w-3xl mx-auto px-4 text-2xl font-bold">
            {currentCaption}
          </h1>
        ) : (
          <p className="text-center max-w-3xl mx-auto px-4">
            {currentCaption}
          </p>
        )}
      </div>
    </div>
  );
};