import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResolutionSelector, VideoResolution } from "./ResolutionSelector";
import { DurationSelector } from "./DurationSelector";

interface VideoSettingsProps {
  selectedResolution: VideoResolution;
  selectedDuration: string;
  onResolutionSelect: (resolution: VideoResolution) => void;
  onDurationSelect: (duration: string) => void;
}

export const VideoSettings = ({
  selectedResolution,
  selectedDuration,
  onResolutionSelect,
  onDurationSelect,
}: VideoSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Settings</CardTitle>
        <CardDescription>Configure your video resolution and duration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ResolutionSelector
          selected={selectedResolution}
          onSelect={onResolutionSelect}
        />
        <DurationSelector
          selectedDuration={selectedDuration}
          onDurationSelect={onDurationSelect}
        />
      </CardContent>
    </Card>
  );
};