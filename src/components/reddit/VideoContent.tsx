import { RefObject, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { CaptionStyle, getCaptionStyle } from "./CaptionStyles";

interface VideoContentProps {
  previewUrl: string;
  titleAudioUrl?: string;
  commentAudioUrl?: string;
  audioRef: RefObject<HTMLAudioElement>;
  onDurationChange?: (duration: number) => void;
  onCaptionsGenerated?: (captions: string) => void;
  captionStyle: CaptionStyle;
  animateCaptions: boolean;
}

export const VideoContent = ({ 
  previewUrl, 
  titleAudioUrl, 
  commentAudioUrl, 
  audioRef,
  onDurationChange,
  onCaptionsGenerated,
  captionStyle,
  animateCaptions
}: VideoContentProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentCaption, setCurrentCaption] = useState("");

  useEffect(() => {
    if (audioRef.current && (titleAudioUrl || commentAudioUrl)) {
      console.log('Setting up audio playback with:', { titleAudioUrl, commentAudioUrl });
      
      const audio = audioRef.current;
      audio.currentTime = 0;

      // Generate captions for the audio
      const generateCaptions = async (audioUrl: string) => {
        try {
          const { data, error } = await supabase.functions.invoke('generate-captions', {
            body: { audioUrl }
          });

          if (error) throw error;

          if (data.captions && onCaptionsGenerated) {
            console.log('Captions generated:', data);
            setCurrentCaption(data.text);
            onCaptionsGenerated(JSON.stringify(data.captions));
          }
        } catch (error) {
          console.error('Error generating captions:', error);
          toast({
            title: "Caption Generation Failed",
            description: "There was an error generating captions. The video will play without them.",
            variant: "destructive",
          });
        }
      };

      // Set up title audio first
      if (titleAudioUrl) {
        audio.src = titleAudioUrl;
        generateCaptions(titleAudioUrl);
      } else if (commentAudioUrl) {
        audio.src = commentAudioUrl;
        generateCaptions(commentAudioUrl);
      }

      const handleTitleEnded = async () => {
        console.log('Title audio ended, playing comments');
        if (commentAudioUrl) {
          audio.src = commentAudioUrl;
          await audio.play();
          generateCaptions(commentAudioUrl);
        }
      };

      const handleCommentEnded = () => {
        console.log('Comments audio ended');
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
        }
      };

      const handleDurationChange = () => {
        if (onDurationChange) {
          // Calculate total duration (title + comments)
          let totalDuration = 0;
          if (titleAudioUrl) {
            const titleAudio = new Audio(titleAudioUrl);
            titleAudio.addEventListener('loadedmetadata', () => {
              totalDuration += titleAudio.duration;
              if (commentAudioUrl) {
                const commentAudio = new Audio(commentAudioUrl);
                commentAudio.addEventListener('loadedmetadata', () => {
                  totalDuration += commentAudio.duration;
                  onDurationChange(totalDuration);
                });
              } else {
                onDurationChange(totalDuration);
              }
            });
          } else if (commentAudioUrl) {
            const commentAudio = new Audio(commentAudioUrl);
            commentAudio.addEventListener('loadedmetadata', () => {
              onDurationChange(commentAudio.duration);
            });
          }
        }
      };

      // If we have both title and comment audio
      if (titleAudioUrl && commentAudioUrl) {
        audio.addEventListener('ended', handleTitleEnded, { once: true });
      } else {
        // If we only have comment audio
        audio.addEventListener('ended', handleCommentEnded);
      }

      // Set up duration change handler
      audio.addEventListener('loadedmetadata', handleDurationChange);
      
      // Start playback
      Promise.all([
        audio.play(),
        videoRef.current?.play()
      ]).catch(error => {
        console.error('Playback error:', error);
      });
      
      return () => {
        audio.removeEventListener('ended', handleTitleEnded);
        audio.removeEventListener('ended', handleCommentEnded);
        audio.removeEventListener('loadedmetadata', handleDurationChange);
        audio.pause();
        audio.src = '';
      };
    }
  }, [titleAudioUrl, commentAudioUrl, audioRef, onDurationChange, onCaptionsGenerated]);

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        src={previewUrl}
        className="w-full h-full object-cover"
        loop
        muted
        playsInline
        autoPlay
      />
      
      {/* Captions overlay */}
      {currentCaption && (
        <div className="absolute bottom-16 left-0 right-0 p-4 flex justify-center">
          <div className={`
            ${getCaptionStyle(captionStyle)}
            ${animateCaptions ? 'animate-fade-up' : ''}
            max-w-[80%] text-center
          `}>
            {currentCaption}
          </div>
        </div>
      )}

      {(titleAudioUrl || commentAudioUrl) && (
        <audio
          ref={audioRef}
          className="hidden"
        />
      )}
    </div>
  );
};
