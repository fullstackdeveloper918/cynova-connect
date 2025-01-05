import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type CaptionStyle = "minimal" | "subtitles" | "captions" | "elevenlabs-default" | "elevenlabs-clean" | "elevenlabs-overlay";

interface CaptionStylesProps {
  selectedStyle: CaptionStyle;
  onStyleSelect: (style: CaptionStyle) => void;
}

export const CaptionStyles = ({
  selectedStyle,
  onStyleSelect,
}: CaptionStylesProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Caption Style</label>
      <Select value={selectedStyle} onValueChange={(value) => onStyleSelect(value as CaptionStyle)}>
        <SelectTrigger>
          <SelectValue placeholder="Select caption style" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="minimal">Minimal</SelectItem>
          <SelectItem value="subtitles">Subtitles</SelectItem>
          <SelectItem value="captions">Closed Captions</SelectItem>
          <SelectItem value="elevenlabs-default">ElevenLabs Default</SelectItem>
          <SelectItem value="elevenlabs-clean">ElevenLabs Clean</SelectItem>
          <SelectItem value="elevenlabs-overlay">ElevenLabs Overlay</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};