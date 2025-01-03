import { motion } from "framer-motion";
import { FileVideo, Folder, Calendar } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface Project {
  id: string;
  title: string;
  description: string | null;
  type: string;
  thumbnail_url: string | null;
  created_at: string;
}

export const ProjectsGrid = ({ projects }: { projects: Project[] }) => {
  const navigate = useNavigate();

  const getProjectTypeIcon = (type: string) => {
    switch (type) {
      case "chatgpt_video":
        return "ChatGPT Video";
      case "fake_text":
        return "Fake Text Video";
      case "reddit_video":
        return "Reddit Video";
      case "split_video":
        return "Split Video";
      case "voiceover_video":
        return "Voiceover Video";
      case "would_you_rather":
        return "Would You Rather";
      case "quiz_video":
        return "Quiz Video";
      default:
        return type;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project, index) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="group relative overflow-hidden rounded-lg border border-accent bg-card hover:shadow-lg transition-all duration-300"
          onClick={() => navigate(`/dashboard/editor?project=${project.id}`)}
          role="button"
          tabIndex={0}
        >
          <div className="aspect-video w-full overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
            {project.thumbnail_url ? (
              <img
                src={project.thumbnail_url}
                alt={project.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="h-full w-full bg-accent/20 flex items-center justify-center">
                <Folder className="h-12 w-12 text-accent-foreground/40" />
              </div>
            )}
            <span className="absolute top-2 right-2 z-20 bg-accent/90 text-accent-foreground px-2 py-1 rounded-full text-xs font-medium">
              {getProjectTypeIcon(project.type)}
            </span>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2 line-clamp-1">{project.title}</h3>
            {project.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {project.description}
              </p>
            )}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span className="flex items-center">
                <FileVideo className="w-4 h-4 mr-1" />
                {project.type.replace(/_/g, " ")}
              </span>
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {format(new Date(project.created_at), "MMM d, yyyy")}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};