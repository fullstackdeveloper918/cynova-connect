import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface PreviewControlsProps {
  currentFrame: number;
  totalFrames: number;
  isPlaying: boolean;
  onFrameChange: (frame: number) => void;
  onPlayPause: () => void;
  onReset: () => void;
}

export const PreviewControls = ({
  currentFrame,
  totalFrames,
  isPlaying,
  onFrameChange,
  onPlayPause,
  onReset,
}: PreviewControlsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onPlayPause}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        <Slider
          value={[currentFrame]}
          max={totalFrames - 1}
          step={1}
          onValueChange={([value]) => onFrameChange(value)}
          className="flex-1"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={onReset}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};