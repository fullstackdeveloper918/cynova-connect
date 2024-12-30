import { motion } from "framer-motion";
import { FileVideo, Folder } from "lucide-react";

// This would typically come from your backend
const mockProjects = [
  {
    id: 1,
    title: "Summer Vlog",
    thumbnail: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e",
    date: "2024-02-20",
    type: "ChatGPT Video",
  },
  {
    id: 2,
    title: "Product Review",
    thumbnail: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    date: "2024-02-19",
    type: "Reddit Video",
  },
  {
    id: 3,
    title: "Tutorial Series",
    thumbnail: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    date: "2024-02-18",
    type: "Voiceover Video",
  },
];

export const ProjectsGrid = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">My Projects</h2>
        <span className="text-muted-foreground">{mockProjects.length} projects</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProjects.map((project) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative overflow-hidden rounded-lg border border-accent bg-card"
          >
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={project.thumbnail}
                alt={project.title}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg">{project.title}</h3>
              <div className="mt-2 flex items-center text-muted-foreground text-sm">
                <FileVideo className="mr-2 h-4 w-4" />
                <span>{project.type}</span>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Created on {new Date(project.date).toLocaleDateString()}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};