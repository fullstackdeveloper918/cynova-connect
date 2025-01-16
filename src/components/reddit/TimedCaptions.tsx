import { useEffect, useState, useRef } from "react";

interface TimedCaptionsProps {
  captions: string;
  audioRef: React.RefObject<HTMLAudioElement>;
  className?: string;
}

interface CaptionSegment {
  text: string;
  startTime: number;
  endTime: number;
}

export const TimedCaptions = ({ captions, audioRef, className = "" }: TimedCaptionsProps) => {
  const [currentCaption, setCurrentCaption] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [captionSegments, setCaptionSegments] = useState<CaptionSegment[]>([]);
  const lastUpdateTimeRef = useRef(0);

  // Calculate timing for each segment
  useEffect(() => {
    if (!captions) return;

    const [title, ...comments] = captions.split('\n\n');
    const commentsText = comments.join('\n\n');
    
    // Average reading speed (words per second)
    const WORDS_PER_SECOND = 2.5;
    
    const calculateSegmentDuration = (text: string) => {
      const wordCount = text.split(/\s+/).length;
      return wordCount / WORDS_PER_SECOND;
    };

    let currentTime = 0;
    const segments: CaptionSegment[] = [];

    // Add title segment
    const titleDuration = calculateSegmentDuration(title);
    segments.push({
      text: title,
      startTime: currentTime,
      endTime: currentTime + titleDuration
    });
    currentTime += titleDuration + 0.5; // Add small pause after title

    // Add comment segments
    const sentences = commentsText
      .split(/(?<=[.!?])\s+/)
      .map(sentence => sentence.trim())
      .filter(Boolean);

    sentences.forEach(sentence => {
      const duration = calculateSegmentDuration(sentence);
      segments.push({
        text: sentence,
        startTime: currentTime,
        endTime: currentTime + duration
      });
      currentTime += duration + 0.3; // Add small pause between sentences
    });

    setCaptionSegments(segments);
    console.log('Caption segments calculated:', segments);
  }, [captions]);

  useEffect(() => {
    if (!audioRef.current || captionSegments.length === 0) return;

    const audio = audioRef.current;
    let animationFrameId: number;

    const updateCaption = () => {
      const now = Date.now();
      if (now - lastUpdateTimeRef.current < 16) { // Limit updates to ~60fps
        animationFrameId = requestAnimationFrame(updateCaption);
        return;
      }
      lastUpdateTimeRef.current = now;

      const currentTime = audio.currentTime;
      console.log('Current audio time:', currentTime);

      // Find the current segment
      const currentSegment = captionSegments.find(
        segment => currentTime >= segment.startTime && currentTime <= segment.endTime
      );

      if (currentSegment) {
        setCurrentCaption(currentSegment.text);
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      if (!audio.paused) {
        animationFrameId = requestAnimationFrame(updateCaption);
      }
    };

    const handleTimeUpdate = () => {
      // Ensure immediate update on time change
      updateCaption();
    };

    const handlePlay = () => {
      setIsVisible(true);
      updateCaption();
    };

    const handlePause = () => {
      cancelAnimationFrame(animationFrameId);
    };

    const handleEnded = () => {
      cancelAnimationFrame(animationFrameId);
      setIsVisible(false);
    };

    // Add event listeners
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("seeking", handleTimeUpdate);

    // Start update loop if audio is already playing
    if (!audio.paused) {
      updateCaption();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("seeking", handleTimeUpdate);
    };
  }, [audioRef, captionSegments]);

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