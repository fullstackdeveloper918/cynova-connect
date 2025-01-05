import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { ChatGPTVideoEditor } from "@/components/chatgpt/ChatGPTVideoEditor";

const ChatGPTVideo = () => {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold mb-4">ChatGPT Videos</h1>
        <p className="text-muted-foreground mb-8">
          Create engaging videos with AI-generated content and narration.
        </p>
        <ChatGPTVideoEditor />
      </div>
    </DashboardLayout>
  );
};

export default ChatGPTVideo;