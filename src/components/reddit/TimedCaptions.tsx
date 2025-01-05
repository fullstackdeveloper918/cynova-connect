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

  // Combine all chunks
  const allChunks = [...titleChunks, ...commentChunks];

  useEffect(() => {
    if (!audioRef.current || allChunks.length === 0) {
      console.log('No audio reference or chunks available');
      return;
    }

    const audio = audioRef.current;
    let currentIndex = -1;
    let lastUpdateTime = 0;

    const updateCaption = (index: number, isTitleSection: boolean) => {
      if (index >= 0 && index < allChunks.length && index !== currentIndex) {
        console.log('Updating caption:', {
          index,
          currentTime: audio.currentTime,
          chunk: allChunks[index],
          totalChunks: allChunks.length,
          audioDuration: audio.duration,
          isTitle: isTitleSection
        });
        
        currentIndex = index;
        setCurrentCaption(allChunks[index]);
        setIsVisible(true);
        setIsShowingTitle(isTitleSection);
      }
    };

    const handleTimeUpdate = () => {
      if (!audio.duration) return;

      const now = Date.now();
      if (now - lastUpdateTime < 100) return;
      lastUpdateTime = now;

      // Check if we're playing the title audio or comments audio
      const src = audio.src;
      const isTitleAudio = src.includes('title');
      
      if (isTitleAudio) {
        // We're playing the title audio
        const progress = (audio.currentTime / audio.duration);
        const titleIndex = Math.floor(progress * titleChunks.length);
        updateCaption(titleIndex, true);
      } else {
        // We're playing the comments audio
        const progress = (audio.currentTime / audio.duration);
        const commentIndex = Math.floor(progress * commentChunks.length);
        updateCaption(titleChunks.length + commentIndex, false);
      }
    };

    const handlePlay = () => {
      console.log('Audio started playing');
      setIsVisible(true);
      const isTitleAudio = audio.src.includes('title');
      updateCaption(0, isTitleAudio);
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
  }, [audioRef, allChunks, titleChunks.length, commentChunks.length]);

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