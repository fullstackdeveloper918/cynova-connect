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
import Profile from "./pages/Profile";
import PlaceholderPage from "./components/PlaceholderPage";
import TikTokDownloader from "./pages/TikTokDownloader";
import YouTubeDownloader from "./pages/YouTubeDownloader";
import Affiliate from "./pages/Affiliate";
import Projects from "./pages/Projects";

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
          <Route path="/dashboard/profile" element={<Profile />} />
          <Route path="/dashboard/projects" element={<Projects />} />
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
          <Route path="/dashboard/tiktok" element={<TikTokDownloader />} />
          <Route path="/dashboard/youtube" element={<YouTubeDownloader />} />
          <Route path="/dashboard/support" element={<PlaceholderPage 
            title="Support" 
            description="Get help and support for all Cynova features and services." 
          />} />
          <Route path="/dashboard/affiliate" element={<Affiliate />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
