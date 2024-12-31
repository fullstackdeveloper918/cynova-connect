import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { UpdatesSection } from "./UpdatesSection";
import { DashboardHero } from "./DashboardHero";
import { FeatureCard } from "./FeatureCard";
import {
  MessageSquare,
  FileVideo,
  Scissors,
  Mic,
} from "lucide-react";

const createSections = [
  {
    id: "chatgpt",
    title: "ChatGPT Videos",
    description: "Create engaging videos with AI-generated content and narration",
    icon: MessageSquare,
    path: "/dashboard/chatgpt",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
  },
  {
    id: "faketext",
    title: "Fake Text Videos",
    description: "Generate realistic text-based content for your videos",
    icon: MessageSquare,
    path: "/dashboard/faketext",
    image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742",
  },
  {
    id: "reddit",
    title: "Reddit Videos",
    description: "Transform Reddit content into engaging video stories",
    icon: FileVideo,
    path: "/dashboard/reddit",
    image: "https://images.unsplash.com/photo-1483058712412-4245e9b90334",
  },
  {
    id: "split",
    title: "Split Videos",
    description: "Easily split and trim your videos with precision",
    icon: Scissors,
    path: "/dashboard/split",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
  },
  {
    id: "voiceover",
    title: "Voiceover Videos",
    description: "Add professional AI voiceovers to your content",
    icon: Mic,
    path: "/dashboard/voiceover",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
  },
];

export const DashboardContent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  return (
    <div className="space-y-8">
      <UpdatesSection />
      <DashboardHero />

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {createSections.map((section, index) => (
          <FeatureCard key={section.id} {...section} index={index} />
        ))}
      </div>
    </div>
  );
};