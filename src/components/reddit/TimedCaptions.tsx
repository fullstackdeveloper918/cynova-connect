import { useEffect, useState, useRef } from "react";

interface TimedCaptionsProps {
  captions: string;
  audioRef: React.RefObject<HTMLAudioElement>;
  className?: string;
  style?: string;
}

interface CaptionSegment {
  text: string;
  startTime: number;
  endTime: number;
  style: string;
}

const WORDS_PER_MINUTE = 150; // Average reading speed
const WORD_DURATION = 60 / WORDS_PER_MINUTE; // Duration per word in seconds

export const TimedCaptions = ({ captions, audioRef, style = "default" }: TimedCaptionsProps) => {
  const [currentCaption, setCurrentCaption] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [captionSegments, setCaptionSegments] = useState<CaptionSegment[]>([]);
  const lastUpdateTimeRef = useRef(0);
  const animationFrameRef = useRef<number>();

  const getStyleClass = () => {
    switch (style) {
      case "minimal":
        return "text-white font-bold text-4xl tracking-tight";
      case "outline":
        return "text-white font-black text-4xl [text-shadow:_2px_2px_0_rgb(0_0_0_/_40%)]";
      case "gradient":
        return "bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 font-bold text-4xl";
      case "gaming":
        return "text-green-400 font-black text-4xl animate-pulse";
      case "modern":
        return "text-yellow-400 font-extrabold text-4xl";
      case "neon":
        return "text-blue-400 font-bold text-4xl [text-shadow:_0_0_5px_rgb(59_130_246_/_50%)]";
      default:
        return "text-white font-medium text-2xl";
    }
  };

  useEffect(() => {
    if (!captions) return;

    const sentences = captions
      .split(/(?<=[.!?])\s+/)
      .map(sentence => sentence.trim())
      .filter(Boolean);

    let currentTime = 0;
    const segments: CaptionSegment[] = sentences.map(sentence => {
      const wordCount = sentence.split(/\s+/).length;
      const duration = wordCount * WORD_DURATION;
      
      const segment = {
        text: sentence,
        startTime: currentTime,
        endTime: currentTime + duration,
        style: getStyleClass()
      };
      
      currentTime += duration + 0.3; // Add small pause between sentences
      return segment;
    });

    setCaptionSegments(segments);
    console.log('Caption segments calculated:', segments);
  }, [captions, style]);

  useEffect(() => {
    if (!audioRef.current || captionSegments.length === 0) return;

    const audio = audioRef.current;

    const updateCaption = () => {
      const currentTime = audio.currentTime;
      
      // Find the current segment based on exact timing
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
        animationFrameRef.current = requestAnimationFrame(updateCaption);
      }
    };

    const handleTimeUpdate = () => {
      // Cancel any existing animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      updateCaption();
    };

    audio.addEventListener("play", updateCaption);
    audio.addEventListener("pause", () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    });
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("seeking", handleTimeUpdate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      audio.removeEventListener("play", updateCaption);
      audio.removeEventListener("pause", updateCaption);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("seeking", handleTimeUpdate);
    };
  }, [audioRef, captionSegments]);

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div 
        className={`transition-all duration-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      >
        <p className={`text-center max-w-3xl mx-auto px-4 ${getStyleClass()}`}>
          {currentCaption}
        </p>
      </div>
    </div>
  );
};