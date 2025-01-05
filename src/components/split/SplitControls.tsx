import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Scissors, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SplitControlsProps {
  currentTime: number;
  duration: number;
  onAddSegment: (start: number, end: number, name: string) => void;
  onSplitVideo: () => void;
  isProcessing: boolean;
}

export const SplitControls = ({
  currentTime,
  duration,
  onAddSegment,
  onSplitVideo,
  isProcessing,
}: SplitControlsProps) => {
  const [segmentName, setSegmentName] = useState("");
  const [startTime, setStartTime] = useState(0);

  const handleSetStart = () => {
    setStartTime(currentTime);
    toast({
      title: "Start point set",
      description: `Start point set at ${currentTime.toFixed(2)} seconds`,
    });
  };

  const handleAddSegment = () => {
    if (!segmentName) {
      toast({
        title: "Name required",
        description: "Please enter a name for this segment",
        variant: "destructive",
      });
      return;
    }

    if (currentTime <= startTime) {
      toast({
        title: "Invalid end point",
        description: "End point must be after start point",
        variant: "destructive",
      });
      return;
    }

    onAddSegment(startTime, currentTime, segmentName);
    setSegmentName("");
    setStartTime(currentTime);
  };

  return (
    <div className="space-y-4 bg-accent/20 p-4 rounded-lg">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Segment name"
          value={segmentName}
          onChange={(e) => setSegmentName(e.target.value)}
        />
        <Button onClick={handleSetStart} variant="outline">
          Set Start ({startTime.toFixed(2)}s)
        </Button>
        <Button onClick={handleAddSegment} variant="outline">
          <Scissors className="mr-2 h-4 w-4" />
          Add Segment
        </Button>
      </div>
      <div className="flex justify-end">
        <Button
          onClick={onSplitVideo}
          disabled={isProcessing}
          className="w-full md:w-auto"
        >
          {isProcessing ? (
            <>
              <Save className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Split Video
            </>
          )}
        </Button>
      </div>
    </div>
  );
};