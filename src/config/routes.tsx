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
import Quiz from "@/pages/Quiz";
import PaymentSuccess from "@/pages/PaymentSuccess";
import { RequireSubscription } from "@/components/auth/RequireSubscription";

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
    path: "/reset-password",
    element: (
      <PlaceholderPage
        title="Reset Password"
        description="Please check your email for the password reset link."
      />
    ),
  },
  {
    path: "/dashboard",
    element: <UserDashboard />,
  },
  {
    path: "/dashboard/editor",
    element: <RequireSubscription><Editor /></RequireSubscription>,
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
    element: <RequireSubscription><Projects /></RequireSubscription>,
  },
  {
    path: "/dashboard/exports",
    element: <RequireSubscription><Exports /></RequireSubscription>,
  },
  {
    path: "/dashboard/chatgpt",
    element: <RequireSubscription><ChatGPTVideo /></RequireSubscription>,
  },
  {
    path: "/dashboard/faketext",
    element: <RequireSubscription><FakeTextVideo /></RequireSubscription>,
  },
  {
    path: "/dashboard/reddit",
    element: <RequireSubscription><RedditVideo /></RequireSubscription>,
  },
  {
    path: "/dashboard/split",
    element: <RequireSubscription><SplitVideo /></RequireSubscription>,
  },
  {
    path: "/dashboard/voiceover",
    element: <RequireSubscription>
      <PlaceholderPage
        title="Voiceover Videos"
        description="Add professional AI voiceovers to your content."
      />
    </RequireSubscription>,
  },
  {
    path: "/dashboard/would-you-rather",
    element: <RequireSubscription><WouldYouRatherVideo /></RequireSubscription>,
  },
  {
    path: "/dashboard/quiz",
    element: <RequireSubscription><Quiz /></RequireSubscription>,
  },
  {
    path: "/dashboard/tiktok",
    element: <RequireSubscription><TikTokDownloader /></RequireSubscription>,
  },
  {
    path: "/dashboard/youtube",
    element: <RequireSubscription><YouTubeDownloader /></RequireSubscription>,
  },
  {
    path: "/admin",
    element: <AdminDashboard />,
  },
  {
    path: "/admin/users",
    element: <UserManagement />,
  },
  {
    path: "/payment-success",
    element: <PaymentSuccess />,
  },
];
