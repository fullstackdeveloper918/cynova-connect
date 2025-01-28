import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BackgroundSectionProps {
  onBackgroundSelect: (background: string) => void;
  selectedBackground: string;
}

const backgrounds = [
  {
    id: "gta",
    name: "GTA V Gameplay",
    description: "High-octane urban action gameplay",
    previewImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2940&ixlib=rb-4.0.3",
    videoUrl: "/stock/gta-gameplay.mp4"
  },
  {
    id: "minecraft",
    name: "Minecraft Gameplay",
    description: "Creative building and survival adventures",
    previewImage: "https://images.unsplash.com/photo-1627856014754-2907e2355d54?q=80&w=2940&ixlib=rb-4.0.3",
    videoUrl: "/stock/minecraft-gameplay.mp4"
  },
  {
    id: "subway",
    name: "Subway Surfers",
    description: "Fast-paced endless runner gameplay",
    previewImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2940&ixlib=rb-4.0.3",
    videoUrl: "/stock/subway-gameplay.mp4"
  }
];

export const BackgroundSection = ({ onBackgroundSelect, selectedBackground }: BackgroundSectionProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Choose Background</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {backgrounds.map((bg) => (
          <Card
            key={bg.id}
            className={cn(
              "group cursor-pointer overflow-hidden transition-all duration-300",
              selectedBackground === bg.id ? "ring-2 ring-primary" : "hover:ring-1 hover:ring-primary/50"
            )}
            onClick={() => onBackgroundSelect(bg.id)}
          >
            <div className="aspect-square relative overflow-hidden">
              <img
                src={bg.previewImage}
                alt={bg.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="font-bold text-lg">{bg.name}</h3>
                <p className="text-sm opacity-75">{bg.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};