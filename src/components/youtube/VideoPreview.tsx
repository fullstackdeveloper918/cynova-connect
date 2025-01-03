import { Video } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Quality } from "./types";

interface VideoPreviewProps {
  videoTitle: string;
  thumbnail: string;
  selectedQuality: string;
  setSelectedQuality: (quality: string) => void;
  qualities: Quality[];
}

export const VideoPreview = ({
  videoTitle,
  thumbnail,
  selectedQuality,
  setSelectedQuality,
  qualities,
}: VideoPreviewProps) => {
  if (!videoTitle) return null;

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="rounded-lg overflow-hidden bg-accent/50">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={videoTitle}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 flex items-center justify-center bg-accent">
            <Video className="h-12 w-12 text-accent-foreground/50" />
          </div>
        )}
      </div>
      
      <div className="font-medium text-lg">{videoTitle}</div>

      <div className="flex gap-2">
        <Select
          value={selectedQuality}
          onValueChange={setSelectedQuality}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select quality" />
          </SelectTrigger>
          <SelectContent>
            {qualities.map((quality) => (
              <SelectItem key={quality.value} value={quality.value}>
                {quality.label} (~{quality.size})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};