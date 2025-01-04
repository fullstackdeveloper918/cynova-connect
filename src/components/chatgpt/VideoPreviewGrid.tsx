import { motion } from "framer-motion";

interface Scene {
  description: string;
  duration: number;
  imageUrl: string;
}

interface VideoPreviewGridProps {
  scenes: Scene[];
}

export const VideoPreviewGrid = ({ scenes }: VideoPreviewGridProps) => {
  if (!scenes.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {scenes.map((scene, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative overflow-hidden rounded-lg border border-accent bg-card"
        >
          <div className="aspect-square w-full overflow-hidden">
            <img
              src={scene.imageUrl}
              alt={scene.description}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="p-4">
            <p className="text-sm text-muted-foreground">{scene.description}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Duration: {scene.duration}s
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};