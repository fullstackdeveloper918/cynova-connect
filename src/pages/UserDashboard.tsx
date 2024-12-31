import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { DashboardContent } from "@/components/DashboardContent";
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
} from "lucide-react";

const UserDashboard = () => {
  const [selectedTool, setSelectedTool] = useState("dashboard");
  const navigate = useNavigate();
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
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-primary">
                Welcome back, {userName}! 👋
              </h1>
              <Button
                onClick={() => navigate("/plans")}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Plans
              </Button>
            </div>
            <DashboardContent />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default UserDashboard;