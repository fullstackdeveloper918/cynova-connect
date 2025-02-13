import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResolutionSelector, VideoResolution } from "./ResolutionSelector";
import { DurationSelector } from "./DurationSelector";
import { CaptionStyles, CaptionStyle } from "./CaptionStyles";

interface VideoSettingsProps {
  selectedResolution: VideoResolution;
  selectedDuration: string;
  selectedCaptionStyle: CaptionStyle;
  onResolutionSelect: (resolution: VideoResolution) => void;
  onDurationSelect: (duration: string) => void;
  onCaptionStyleSelect: (style: CaptionStyle) => void;
}

export const VideoSettings = ({
  selectedResolution,
  selectedDuration,
  selectedCaptionStyle,
  onResolutionSelect,
  onDurationSelect,
  onCaptionStyleSelect,
}: VideoSettingsProps) => {
  return (
    <Card className="bg-white hover:shadow-lg">
      <CardHeader>
        <CardTitle>Video Settings</CardTitle>
        <CardDescription>Configure your video resolution, duration, and captions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <DurationSelector
          selectedDuration={selectedDuration}
          onDurationSelect={onDurationSelect}
        />
        <ResolutionSelector
          selected={selectedResolution}
          onSelect={onResolutionSelect}
        />
        <CaptionStyles
          selectedStyle={selectedCaptionStyle}
          onStyleSelect={onCaptionStyleSelect}
        />
      </CardContent>
    </Card>
  );
};