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

    const updateCaption = (index: number) => {
      if (index >= 0 && index < allChunks.length && index !== currentIndex) {
        const isTitleChunk = index < titleChunks.length;
        
        console.log('Updating caption:', {
          index,
          currentTime: audio.currentTime,
          chunk: allChunks[index],
          totalChunks: allChunks.length,
          audioDuration: audio.duration,
          isTitle: isTitleChunk
        });
        
        currentIndex = index;
        setCurrentCaption(allChunks[index]);
        setIsVisible(true);
        setIsShowingTitle(isTitleChunk);
      }
    };

    const handleTimeUpdate = () => {
      if (!audio.duration) return;

      const now = Date.now();
      if (now - lastUpdateTime < 100) return;
      lastUpdateTime = now;

      // Calculate proportional durations with adjustments for better sync
      const titleDuration = (titleChunks.length / allChunks.length) * audio.duration * 1.2;
      const currentTime = audio.currentTime;
      
      let currentChunkIndex;
      const syncOffset = 0.2;

      // Check if we're playing the title audio or comments audio
      const src = audio.src;
      const isTitleAudio = src.includes('title');
      
      if (isTitleAudio || currentTime < titleDuration) {
        // We're in the title section
        const titleProgress = (currentTime + syncOffset) / titleDuration;
        currentChunkIndex = Math.floor(titleProgress * titleChunks.length);
      } else {
        // We're in the comments section
        const remainingTime = audio.duration - titleDuration;
        const commentProgress = (currentTime - titleDuration + syncOffset) / remainingTime;
        currentChunkIndex = titleChunks.length + Math.floor(commentProgress * commentChunks.length);
      }
      
      const adjustedIndex = Math.max(0, Math.min(Math.floor(currentChunkIndex), allChunks.length - 1));
      updateCaption(adjustedIndex);
    };

    const handlePlay = () => {
      console.log('Audio started playing');
      setIsVisible(true);
      updateCaption(0);
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
  }, [audioRef, allChunks, titleChunks.length]);

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