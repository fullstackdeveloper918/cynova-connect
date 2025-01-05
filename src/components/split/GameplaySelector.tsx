import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

const GAMEPLAY_OPTIONS = [
  {
    id: "minecraft",
    name: "Minecraft",
    url: "/stock/minecraft-gameplay.mp4",
  },
  {
    id: "gta",
    name: "GTA",
    url: "/stock/gta-gameplay.mp4",
  },
];

interface GameplaySelectorProps {
  onSelect: (url: string) => void;
  selectedUrl?: string;
}

export const GameplaySelector = ({ onSelect, selectedUrl }: GameplaySelectorProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Select Gameplay Background</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {GAMEPLAY_OPTIONS.map((option) => (
          <Card 
            key={option.id}
            className={`cursor-pointer transition-all ${
              selectedUrl === option.url ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onSelect(option.url)}
          >
            <CardContent className="p-4">
              <div className="aspect-video relative overflow-hidden rounded-md bg-black">
                <video
                  src={option.url}
                  className="absolute inset-0 w-full h-full object-cover"
                  muted
                  loop
                  autoPlay
                />
              </div>
              <div className="mt-2 text-center font-medium">{option.name}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};