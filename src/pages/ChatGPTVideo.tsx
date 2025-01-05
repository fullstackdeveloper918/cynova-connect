import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { ChatGPTVideoEditor } from "@/components/chatgpt/ChatGPTVideoEditor";

const ChatGPTVideo = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">ChatGPT Video Creator</h1>
        <p className="text-muted-foreground">
          Create engaging videos using ChatGPT-powered content generation.
        </p>
        <ChatGPTVideoEditor />
      </div>
    </DashboardLayout>
  );
};

export default ChatGPTVideo;