import { RedditPost } from "./RedditPost";
import { TimedCaptions } from "./TimedCaptions";
import { CaptionStyle } from "./CaptionStyles";
import { RefObject } from "react";

interface ContentOverlayProps {
  title: string;
  comments: string;
  audioRef: RefObject<HTMLAudioElement>;
  captionStyle: string;
}

export const ContentOverlay = ({ title, comments, audioRef, captionStyle }: ContentOverlayProps) => {
  console.log('Rendering ContentOverlay with:', { title, comments, captionStyle });
  
  return (
    <div className="absolute inset-0 flex flex-col justify-between bg-black/40">
      {/* Title Section */}
      <div className="p-4">
        <div className="max-w-2xl mx-auto">
          <RedditPost title={title} darkMode />
        </div>
      </div>
      
      {/* Timed Captions */}
      {comments && (
        <div className="mb-8 px-4 z-10">
          <TimedCaptions
            captions={comments}
            audioRef={audioRef}
            className={captionStyle}
          />
        </div>
      )}
    </div>
  );
};