import PlaceholderPage from "@/components/PlaceholderPage";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import UserDashboard from "@/pages/UserDashboard";
import Editor from "@/pages/Editor";
import Plans from "@/pages/Plans";
import Profile from "@/pages/Profile";
import TikTokDownloader from "@/pages/TikTokDownloader";
import YouTubeDownloader from "@/pages/YouTubeDownloader";
import Affiliate from "@/pages/Affiliate";
import Projects from "@/pages/Projects";
import Exports from "@/pages/Exports";
import ChatGPTVideo from "@/pages/ChatGPTVideo";

export const routes = [
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/dashboard",
    element: <UserDashboard />,
  },
  {
    path: "/dashboard/editor",
    element: <Editor />,
  },
  {
    path: "/plans",
    element: <Plans />,
  },
  {
    path: "/dashboard/profile",
    element: <Profile />,
  },
  {
    path: "/dashboard/projects",
    element: <Projects />,
  },
  {
    path: "/dashboard/exports",
    element: <Exports />,
  },
  {
    path: "/dashboard/chatgpt",
    element: <ChatGPTVideo />,
  },
  {
    path: "/dashboard/faketext",
    element: (
      <PlaceholderPage
        title="Fake Text Videos"
        description="Generate realistic text-based content for your videos."
      />
    ),
  },
  {
    path: "/dashboard/reddit",
    element: (
      <PlaceholderPage
        title="Reddit Videos"
        description="Transform Reddit content into engaging video stories."
      />
    ),
  },
  {
    path: "/dashboard/split",
    element: (
      <PlaceholderPage
        title="Split Videos"
        description="Easily split and trim your videos with precision."
      />
    ),
  },
  {
    path: "/dashboard/voiceover",
    element: (
      <PlaceholderPage
        title="Voiceover Videos"
        description="Add professional AI voiceovers to your content."
      />
    ),
  },
  {
    path: "/dashboard/would-you-rather",
    element: (
      <PlaceholderPage
        title="Would You Rather Videos"
        description="Create engaging decision-based content videos."
      />
    ),
  },
  {
    path: "/dashboard/quiz",
    element: (
      <PlaceholderPage
        title="Quiz Videos"
        description="Generate interactive quiz videos to engage your audience."
      />
    ),
  },
  {
    path: "/dashboard/tiktok",
    element: <TikTokDownloader />,
  },
  {
    path: "/dashboard/youtube",
    element: <YouTubeDownloader />,
  },
  {
    path: "/dashboard/support",
    element: (
      <PlaceholderPage
        title="Support"
        description="Get help and support for all Cynova features and services."
      />
    ),
  },
  {
    path: "/dashboard/affiliate",
    element: <Affiliate />,
  },
];
