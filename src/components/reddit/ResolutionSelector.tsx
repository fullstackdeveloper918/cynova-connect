import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export type VideoResolution = "youtube" | "shorts" | "tiktok";

interface ResolutionSelectorProps {
  selected: VideoResolution;
  onSelect: (resolution: VideoResolution) => void;
}

export const ResolutionSelector = ({ selected, onSelect }: ResolutionSelectorProps) => {
  const resolutions = [
    { id: "youtube", label: "YouTube (16:9)", dimensions: "1920x1080" },
    { id: "shorts", label: "YouTube Shorts (9:16)", dimensions: "1080x1920" },
    { id: "tiktok", label: "TikTok (9:16)", dimensions: "1080x1920" },
  ] as const;

  return (
    <RadioGroup
      value={selected}
      onValueChange={(value) => onSelect(value as VideoResolution)}
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      {resolutions.map((resolution) => (
        <div key={resolution.id} className="flex items-center space-x-2">
          <RadioGroupItem value={resolution.id} id={resolution.id} />
          <Label htmlFor={resolution.id} className="flex flex-col">
            <span className="font-medium">{resolution.label}</span>
            <span className="text-sm text-muted-foreground">{resolution.dimensions}</span>
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
};