import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UpdatesSection } from "./UpdatesSection";
import { ProjectsGrid } from "./ProjectsGrid";
import { ExportsGrid } from "./ExportsGrid";
import { useUser } from "@/hooks/useUser";

const createSections = [
  {
    title: "Create Video",
    description: "Start creating your video content.",
    action: "/dashboard/editor",
  },
  {
    title: "Manage Projects",
    description: "View and manage your existing projects.",
    action: "/dashboard/projects",
  },
  {
    title: "Export Videos",
    description: "Export your videos for sharing.",
    action: "/dashboard/exports",
  },
  {
    title: "ChatGPT Videos",
    description: "Create engaging videos using AI-generated content.",
    action: "/dashboard/chatgpt",
  },
  {
    title: "Fake Text Videos",
    description: "Generate realistic text-based content for your videos.",
    action: "/dashboard/faketext",
  },
  {
    title: "Reddit Videos",
    description: "Transform Reddit content into engaging video stories.",
    action: "/dashboard/reddit",
  },
  {
    title: "Split Videos",
    description: "Easily split and trim your videos with precision.",
    action: "/dashboard/split",
  },
  {
    title: "Voiceover Videos",
    description: "Add professional AI voiceovers to your content.",
    action: "/dashboard/voiceover",
  },
  {
    title: "Would You Rather Videos",
    description: "Create engaging decision-based content videos.",
    action: "/dashboard/would-you-rather",
  },
  {
    title: "Quiz Videos",
    description: "Generate interactive quiz videos to engage your audience.",
    action: "/dashboard/quiz",
  },
  {
    title: "TikTok Downloader",
    description: "Download and manage TikTok videos for your content.",
    action: "/dashboard/tiktok",
  },
  {
    title: "YouTube Downloader",
    description: "Download and manage YouTube videos for your content.",
    action: "/dashboard/youtube",
  },
  {
    title: "Support",
    description: "Get help and support for all Cynova features and services.",
    action: "/dashboard/support",
  },
];

export const DashboardContent = () => {
  const navigate = useNavigate();
  const { data: user } = useUser();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">
          Welcome back, {user?.name}! 👋
        </h1>
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
            className="gap-2"
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
          <div key={index} className="p-4 border rounded-md">
            <h2 className="text-lg font-semibold">{section.title}</h2>
            <p className="text-muted-foreground">{section.description}</p>
            <Button
              onClick={() => navigate(section.action)}
              className="mt-2"
            >
              Go
            </Button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ProjectsGrid />
        <ExportsGrid />
      </div>
    </div>
  );
};
