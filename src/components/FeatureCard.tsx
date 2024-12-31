import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  image: string;
  index: number;
}

export const FeatureCard = ({
  title,
  description,
  icon: Icon,
  path,
  image,
  index,
}: FeatureCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-xl border border-accent bg-card"
    >
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">{title}</h3>
        </div>
        <p className="mb-4 text-muted-foreground">{description}</p>
        <Button
          onClick={() => navigate(path)}
          variant="outline"
          className="w-full"
        >
          Start Creating
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};