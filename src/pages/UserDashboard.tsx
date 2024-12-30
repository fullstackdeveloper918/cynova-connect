import { useState } from "react";
import { VideoEditor } from "@/components/VideoEditor";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [selectedTool, setSelectedTool] = useState("editor");
  const { toast } = useToast();
  // Temporary user data - In a real app, this would come from your auth system
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

  const features = [
    {
      icon: MessageSquare,
      title: "AI Video Creation",
      description: "Create engaging videos using ChatGPT and other AI tools",
    },
    {
      icon: FileVideo,
      title: "Content Automation",
      description: "Automate your content creation with Reddit and text-to-video",
    },
    {
      icon: Scissors,
      title: "Video Processing",
      description: "Split, edit, and enhance your videos with professional tools",
    },
    {
      icon: Mic,
      title: "Voice Features",
      description: "Add professional voiceovers to your videos",
    },
  ];

  const renderContent = () => {
    if (selectedTool === "editor") {
      return (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow border border-accent group"
              >
                <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-primary">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
          <VideoEditor />
        </>
      );
    }
    return null;
  };

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
            className="max-w-7xl mx-auto space-y-8"
          >
            <div className="flex justify-between items-center">
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
            {renderContent()}
          </motion.div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default UserDashboard;
