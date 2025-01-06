import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  index: number;
  isDisabled?: boolean;
  onClick?: () => void;
}

export const FeatureCard = ({
  title,
  description,
  icon: Icon,
  index,
  isDisabled,
  onClick,
}: FeatureCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "group relative overflow-hidden rounded-lg border p-6 shadow-md transition-all hover:shadow-lg",
        isDisabled && "opacity-75 cursor-not-allowed"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="rounded-full bg-primary/10 p-3">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {isDisabled && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center">
          <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
            Premium Feature
          </div>
        </div>
      )}
    </motion.div>
  );
};