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
    <div className="absolute inset-0 bg-black/40">
      {/* Title Section */}
      <div className="p-4">
        <div className="max-w-2xl mx-auto">
          <RedditPost title={title} darkMode />
        </div>
      </div>
      
      {/* Timed Captions */}
      {comments && (
        <div className="absolute bottom-8 left-0 right-0 text-center px-4">
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