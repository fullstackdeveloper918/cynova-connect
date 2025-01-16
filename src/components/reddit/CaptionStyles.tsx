import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export type CaptionStyle = 
  | "minimal" 
  | "gaming" 
  | "modern" 
  | "gradient" 
  | "outline" 
  | "neon"
  | "subtitles"
  | "captions"
  | "assembly-default"
  | "assembly-clean"
  | "assembly-overlay";

interface CaptionStylesProps {
  selectedStyle: CaptionStyle;
  onStyleSelect: (style: CaptionStyle) => void;
  animate: boolean;
  onAnimateChange: (animate: boolean) => void;
}

export const getCaptionStyle = (style: CaptionStyle): string => {
  switch (style) {
    case "minimal":
      return "bg-black/60 text-white px-3 py-2 rounded-md text-lg font-medium shadow-lg";
    case "gaming":
      return "bg-black/80 text-green-400 px-4 py-3 rounded-lg text-xl font-black uppercase tracking-wider shadow-xl border border-green-500/20";
    case "modern":
      return "bg-gradient-to-r from-black/90 to-black/70 text-yellow-400 px-5 py-4 rounded-xl text-2xl font-extrabold tracking-tight shadow-2xl";
    case "gradient":
      return "bg-black/75 px-4 py-3 rounded-lg text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 text-xl font-bold shadow-xl";
    case "outline":
      return "bg-black/60 text-white px-4 py-3 rounded-lg text-xl font-black [text-shadow:_2px_2px_0_rgb(0_0_0_/_40%)] shadow-lg";
    case "neon":
      return "bg-black/70 text-blue-400 px-4 py-3 rounded-lg text-xl font-bold [text-shadow:_0_0_5px_rgb(59_130_246_/_50%)] shadow-xl";
    case "subtitles":
      return "bg-black/80 text-white px-4 py-3 rounded-lg text-xl font-semibold shadow-xl";
    case "captions":
      return "bg-black/90 text-white px-5 py-4 rounded-xl text-2xl font-bold shadow-2xl";
    case "assembly-default":
      return "bg-black/75 text-white px-4 py-3 rounded-lg text-xl font-medium leading-relaxed tracking-wide shadow-xl border border-white/10";
    case "assembly-clean":
      return "bg-gradient-to-b from-black/80 to-black/60 text-white px-5 py-3 rounded-xl text-xl font-medium tracking-wide shadow-lg backdrop-blur-sm";
    case "assembly-overlay":
      return "bg-gradient-to-r from-blue-900/80 via-blue-800/70 to-blue-900/80 text-white px-6 py-4 rounded-2xl text-xl font-semibold tracking-wide shadow-2xl border border-blue-500/20";
    default:
      return "bg-black/80 text-white px-4 py-3 rounded-lg text-xl shadow-lg";
  }
};

export const CaptionStyles = ({
  selectedStyle,
  onStyleSelect,
  animate,
  onAnimateChange,
}: CaptionStylesProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Caption Style</Label>
        <div className="flex items-center space-x-2">
          <Switch 
            id="animate-captions" 
            checked={animate}
            onCheckedChange={onAnimateChange}
          />
          <Label htmlFor="animate-captions">Animate captions</Label>
        </div>
      </div>

      <Select value={selectedStyle} onValueChange={(value) => onStyleSelect(value as CaptionStyle)}>
        <SelectTrigger>
          <SelectValue placeholder="Select caption style" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="minimal">Minimal</SelectItem>
          <SelectItem value="gaming">Gaming Style</SelectItem>
          <SelectItem value="modern">Modern Style</SelectItem>
          <SelectItem value="gradient">Gradient Style</SelectItem>
          <SelectItem value="outline">Outline Style</SelectItem>
          <SelectItem value="neon">Neon Style</SelectItem>
          <SelectItem value="subtitles">Subtitles</SelectItem>
          <SelectItem value="captions">Captions</SelectItem>
          <SelectItem value="assembly-default">Assembly Default</SelectItem>
          <SelectItem value="assembly-clean">Assembly Clean</SelectItem>
          <SelectItem value="assembly-overlay">Assembly Overlay</SelectItem>
        </SelectContent>
      </Select>

      {/* Preview of selected style */}
      <div className="mt-4 p-4 bg-zinc-900 rounded-lg">
        <p className={`text-center ${getCaptionStyle(selectedStyle)}`}>
          Preview Text
        </p>
      </div>
    </div>
  );
};