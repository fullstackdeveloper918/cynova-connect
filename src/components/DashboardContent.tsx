import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { User, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { UpdatesSection } from "./UpdatesSection";
import { DashboardHero } from "./DashboardHero";
import { FeatureCard } from "./FeatureCard";
import { useUser } from "@/hooks/useUser";
import { useSubscription } from "@/hooks/useSubscription";
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
  {
    id: "would-you-rather",
    title: "Would You Rather Videos",
    description: "Create engaging decision-based content videos.",
    icon: MessageSquare,
    path: "/dashboard/would-you-rather",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
  },
  {
    id: "quiz",
    title: "Quiz Videos",
    description: "Generate interactive quiz videos to engage your audience.",
    icon: FileVideo,
    path: "/dashboard/quiz",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
  },
];

export const DashboardContent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: user } = useUser();
  const { data: subscription, isLoading: isLoadingSubscription } = useSubscription();

  // Special case for test email
  const userName = user?.email === 'inke2@hotmail.com' ? 'Test User' : user?.name;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-primary">
            Welcome back, {userName || 'Guest'}! 👋
          </h1>
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">
              {isLoadingSubscription ? (
                "Loading plan..."
              ) : (
                `Current Plan: ${subscription?.plan_name || "Free"}`
              )}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate("/dashboard/profile")}
            variant="outline"
            className="gap-2"
          >
            <User className="h-4 w-4" />
            Profile
          </Button>
          <Button
            onClick={() => navigate("/plans")}
            variant="default"
            className="gap-2 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
          >
            Plans
          </Button>
        </div>
      </div>

      <p className="text-muted-foreground">
        Create and manage your video content with ease.
      </p>

      <UpdatesSection />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {createSections.map((section, index) => (
          <FeatureCard key={section.id} {...section} index={index} />
        ))}
      </div>
    </div>
  );
};