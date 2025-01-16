import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CaptionSectionProps {
  onCaptionSelect: (style: string) => void;
  selectedStyle: string;
}

const captionStyles = [
  {
    id: "minimal",
    name: "Clean Minimal",
    preview: "THE QUICK",
    style: "text-white font-bold text-4xl"
  },
  {
    id: "gaming",
    name: "Gaming Style",
    preview: "THE QUICK BROWN FOX",
    style: "text-green-400 font-black text-4xl"
  },
  {
    id: "modern",
    name: "Modern Style",
    preview: "FOX",
    style: "text-yellow-400 font-extrabold text-4xl"
  },
  {
    id: "gradient",
    name: "Gradient Style",
    preview: "THE QUICK BROWN FOX",
    style: "bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 font-bold text-4xl"
  },
  {
    id: "outline",
    name: "Outline Style",
    preview: "THE QUICK",
    style: "text-white font-black text-4xl [text-shadow:_2px_2px_0_rgb(0_0_0_/_40%)]"
  },
  {
    id: "neon",
    name: "Neon Style",
    preview: "BROWN FOX",
    style: "text-blue-400 font-bold text-4xl [text-shadow:_0_0_5px_rgb(59_130_246_/_50%)]"
  }
];

export const CaptionsSection = ({ onCaptionSelect, selectedStyle }: CaptionSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Select Caption Template</h3>
        <div className="flex items-center space-x-2">
          <Switch id="animate-captions" />
          <Label htmlFor="animate-captions">Animate captions in generation</Label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {captionStyles.map((style) => (
          <Card
            key={style.id}
            className={cn(
              "p-6 cursor-pointer transition-all duration-300",
              selectedStyle === style.id ? "ring-2 ring-primary" : "hover:ring-1 hover:ring-primary/50"
            )}
            onClick={() => onCaptionSelect(style.id)}
          >
            <div className="aspect-video bg-zinc-900 rounded-lg flex items-center justify-center mb-3">
              <span className={cn(style.style)}>{style.preview}</span>
            </div>
            <p className="text-sm font-medium text-center">{style.name}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};