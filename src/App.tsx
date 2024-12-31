import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";
import Editor from "./pages/Editor";
import Plans from "./pages/Plans";
import PlaceholderPage from "./components/PlaceholderPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/dashboard/editor" element={<Editor />} />
          <Route path="/plans" element={<Plans />} />
          <Route 
            path="/dashboard/projects" 
            element={<PlaceholderPage 
              title="My Projects" 
              description="View and manage all your Cynova video projects in one place." 
            />} 
          />
          <Route 
            path="/dashboard/exports" 
            element={<PlaceholderPage 
              title="My Exports" 
              description="Access all your exported videos and manage your content library." 
            />} 
          />
          <Route 
            path="/dashboard/chatgpt" 
            element={<PlaceholderPage 
              title="ChatGPT Videos" 
              description="Create engaging videos using AI-generated content and narration." 
            />} 
          />
          <Route 
            path="/dashboard/faketext" 
            element={<PlaceholderPage 
              title="Fake Text Videos" 
              description="Generate realistic text-based content for your videos." 
            />} 
          />
          <Route 
            path="/dashboard/reddit" 
            element={<PlaceholderPage 
              title="Reddit Videos" 
              description="Transform Reddit content into engaging video stories." 
            />} 
          />
          <Route 
            path="/dashboard/split" 
            element={<PlaceholderPage 
              title="Split Videos" 
              description="Easily split and trim your videos with precision." 
            />} 
          />
          <Route 
            path="/dashboard/voiceover" 
            element={<PlaceholderPage 
              title="Voiceover Videos" 
              description="Add professional AI voiceovers to your content." 
            />} 
          />
          <Route 
            path="/dashboard/would-you-rather" 
            element={<PlaceholderPage 
              title="Would You Rather Videos" 
              description="Create engaging decision-based content videos." 
            />} 
          />
          <Route 
            path="/dashboard/quiz" 
            element={<PlaceholderPage 
              title="Quiz Videos" 
              description="Generate interactive quiz videos to engage your audience." 
            />} 
          />
          <Route 
            path="/dashboard/tiktok" 
            element={<PlaceholderPage 
              title="TikTok Downloader" 
              description="Download and manage TikTok videos for your content." 
            />} 
          />
          <Route 
            path="/dashboard/youtube" 
            element={<PlaceholderPage 
              title="YouTube Downloader" 
              description="Download and manage YouTube videos for your content." 
            />} 
          />
          <Route 
            path="/dashboard/support" 
            element={<PlaceholderPage 
              title="Support" 
              description="Get help and support for all Cynova features and services." 
            />} 
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
