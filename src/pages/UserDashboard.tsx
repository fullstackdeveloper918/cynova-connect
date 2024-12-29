import { useState } from "react";
import { VideoEditor } from "@/components/VideoEditor";
import { motion } from "framer-motion";
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
} from "@/components/ui/sidebar";
import {
  Video,
  MessageSquare,
  Scissors,
  Eye,
  Mic,
  Edit,
  FileVideo,
} from "lucide-react";
import { Card } from "@/components/ui/card";

const UserDashboard = () => {
  const [selectedTool, setSelectedTool] = useState("editor");

  const sidebarItems = [
    { id: "editor", title: "Cynova Editor", icon: Edit },
    { id: "reddit", title: "Reddit Video", icon: FileVideo },
    { id: "texts", title: "Fake Texts Video", icon: MessageSquare },
    { id: "chatgpt", title: "ChatGPT Video", icon: MessageSquare },
    { id: "split", title: "Split Video", icon: Scissors },
    { id: "blur", title: "Blur Video", icon: Eye },
    { id: "voiceover", title: "Voiceover Video", icon: Mic },
  ];

  const previewItems = [
    {
      id: 1,
      title: "Example 1",
      description: "Create engaging content with Cynova Editor",
    },
    {
      id: 2,
      title: "Example 2",
      description: "Transform Reddit posts into viral videos",
    },
    {
      id: 3,
      title: "Example 3",
      description: "Generate custom text message conversations",
    },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Tools</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setSelectedTool(item.id)}
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
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto space-y-8"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Video Editor Dashboard
            </h1>

            {/* Preview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {previewItems.map((item) => (
                <Card key={item.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Video className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Tool Content */}
            {selectedTool === "editor" && <VideoEditor />}
            {/* Other tool components will be added here */}
          </motion.div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default UserDashboard;
