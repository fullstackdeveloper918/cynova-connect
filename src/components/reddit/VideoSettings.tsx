import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResolutionSelector, VideoResolution } from "./ResolutionSelector";
import { BackgroundSelector } from "./BackgroundSelector";

interface VideoSettingsProps {
  selectedResolution: VideoResolution;
  selectedBackground: string;
  onResolutionSelect: (resolution: VideoResolution) => void;
  onBackgroundSelect: (background: string) => void;
}

export const VideoSettings = ({
  selectedResolution,
  selectedBackground,
  onResolutionSelect,
  onBackgroundSelect,
}: VideoSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Settings</CardTitle>
        <CardDescription>
          Choose your video resolution and background
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Resolution</label>
          <ResolutionSelector
            selected={selectedResolution}
            onSelect={onResolutionSelect}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Background Video</label>
          <BackgroundSelector
            selected={selectedBackground}
            onSelect={onBackgroundSelect}
          />
        </div>
      </CardContent>
    </Card>
  );
};