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
} from "lucide-react";

export const sidebarSections = [
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