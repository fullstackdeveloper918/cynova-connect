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
import FakeTextVideo from "@/pages/FakeTextVideo";
import RedditVideo from "@/pages/RedditVideo";
import SplitVideo from "@/pages/SplitVideo";
import WouldYouRatherVideo from "@/pages/WouldYouRatherVideo";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import UserManagement from "@/pages/admin/UserManagement";

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
    element: <FakeTextVideo />,
  },
  {
    path: "/dashboard/reddit",
    element: <RedditVideo />,
  },
  {
    path: "/dashboard/split",
    element: <SplitVideo />,
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
    element: <WouldYouRatherVideo />,
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
  {
    path: "/admin",
    element: <AdminDashboard />,
  },
  {
    path: "/admin/users",
    element: <UserManagement />,
  },
];
