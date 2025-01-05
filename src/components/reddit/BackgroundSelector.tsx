import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BackgroundOption {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  videoUrl: string;
}

const backgrounds: BackgroundOption[] = [
  {
    id: "gta",
    name: "GTA V Gameplay",
    description: "High-octane urban action gameplay",
    previewImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2940&ixlib=rb-4.0.3",
    videoUrl: "/stock/gta-gameplay.mp4",
  },
  {
    id: "minecraft",
    name: "Minecraft Gameplay",
    description: "Creative building and survival adventures",
    previewImage: "https://images.unsplash.com/photo-1627856014754-2907e2355d54?q=80&w=2940&ixlib=rb-4.0.3",
    videoUrl: "/stock/minecraft-gameplay.mp4",
  },
  {
    id: "subway",
    name: "Subway Surfers",
    description: "Fast-paced endless runner gameplay",
    previewImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2940&ixlib=rb-4.0.3",
    videoUrl: "/stock/subway-gameplay.mp4",
  },
];

interface BackgroundSelectorProps {
  selected: string;
  onSelect: (videoUrl: string) => void;
}

export const BackgroundSelector = ({
  selected,
  onSelect,
}: BackgroundSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Background</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {backgrounds.map((bg) => (
            <div
              key={bg.id}
              className={cn(
                "group cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-300",
                selected === bg.videoUrl
                  ? "border-primary shadow-lg"
                  : "border-transparent hover:border-primary/50"
              )}
              onClick={() => onSelect(bg.videoUrl)}
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={bg.previewImage}
                  alt={bg.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="font-bold">{bg.name}</h3>
                  <p className="text-sm opacity-75">{bg.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};