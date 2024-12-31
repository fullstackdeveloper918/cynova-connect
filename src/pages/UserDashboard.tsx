import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Edit,
  FolderOpen,
  Download,
  MessageSquare,
  FileVideo,
  Scissors,
  Mic,
  Video,
  Youtube,
  Headphones,
  ChevronDown,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UpdatesSection } from "@/components/UpdatesSection";

const DashboardContent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

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

  return (
    <div className="space-y-8">
      <UpdatesSection />
      
      {/* Hero Card */}
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

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {createSections.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative overflow-hidden rounded-xl border border-accent bg-card"
          >
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={section.image}
                alt={section.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <section.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{section.title}</h3>
              </div>
              <p className="mb-4 text-muted-foreground">{section.description}</p>
              <Button
                onClick={() => navigate(section.path)}
                variant="outline"
                className="w-full"
              >
                Start Creating
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const UserDashboard = () => {
  const [selectedTool, setSelectedTool] = useState("dashboard");
  const navigate = useNavigate();
  const { toast } = useToast();
  const userName = "John";

  const sidebarSections = [
    {
      label: "Cynova Dashboard",
      icon: LayoutDashboard,
      items: [
        { id: "editor", title: "Editor", icon: Edit, path: "/dashboard/editor" },
        { id: "projects", title: "My Projects", icon: FolderOpen, path: "/dashboard/projects" },
        { id: "exports", title: "My Exports", icon: Download, path: "/dashboard/exports" },
      ],
    },
    {
      label: "Cynova Create",
      icon: Video,
      items: [
        { id: "chatgpt", title: "ChatGPT Videos", icon: MessageSquare, path: "/dashboard/chatgpt" },
        { id: "faketext", title: "Fake Text Videos", icon: MessageSquare, path: "/dashboard/faketext" },
        { id: "reddit", title: "Reddit Videos", icon: FileVideo, path: "/dashboard/reddit" },
        { id: "split", title: "Split Videos", icon: Scissors, path: "/dashboard/split" },
        { id: "voiceover", title: "Voiceover Videos", icon: Mic, path: "/dashboard/voiceover" },
        { id: "would-you-rather", title: "Would You Rather Videos", icon: MessageSquare, path: "/dashboard/would-you-rather" },
        { id: "quiz", title: "Quiz Videos", icon: FileVideo, path: "/dashboard/quiz" },
      ],
    },
    {
      label: "Cynova Tools",
      icon: Video,
      items: [
        { id: "tiktok", title: "TikTok Downloader", icon: Video, path: "/dashboard/tiktok" },
        { id: "youtube", title: "Youtube Downloader", icon: Youtube, path: "/dashboard/youtube" },
      ],
    },
    {
      label: "Cynova Support",
      icon: Headphones,
      items: [
        { id: "support", title: "Support", icon: Headphones, path: "/dashboard/support" },
      ],
    },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar>
          <SidebarHeader className="p-4">
            <img
              src="/logo.png"
              alt="Cynova Logo"
              className="h-8 w-auto mx-auto"
            />
          </SidebarHeader>
          <SidebarContent>
            {sidebarSections.map((section) => (
              <SidebarGroup key={section.label}>
                <SidebarGroupLabel>
                  <section.icon className="mr-2 h-4 w-4" />
                  {section.label}
                  <ChevronDown className="ml-auto h-4 w-4" />
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          onClick={() => {
                            setSelectedTool(item.id);
                            navigate(item.path);
                          }}
                          tooltip={item.title}
                          isActive={selectedTool === item.id}
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-primary">
                Welcome back, {userName}! 👋
              </h1>
              <Button
                onClick={() => {
                  toast({
                    title: "Upgrade Coming Soon",
                    description: "Premium features will be available soon!",
                  });
                }}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Upgrade to Premium
              </Button>
            </div>
            <DashboardContent />
          </motion.div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default UserDashboard;