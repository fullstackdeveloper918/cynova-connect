import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const DashboardHero = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-primary/10 via-accent to-secondary/10 rounded-xl p-8 relative overflow-hidden"
    >
      <div className="relative z-10">
        <h2 className="text-3xl font-bold mb-4">Create Shorts with AI</h2>
        <p className="text-lg text-muted-foreground mb-6 max-w-2xl">
          Your ultimate tool for generating AI voiceovers, captivating subtitles, enhanced gameplay, and much more.
        </p>
        <Button
          onClick={() => navigate("/dashboard/editor")}
          className="bg-primary hover:bg-primary/90"
        >
          Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};