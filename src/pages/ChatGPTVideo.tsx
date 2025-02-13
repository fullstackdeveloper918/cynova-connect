import { MobileSidebar } from "@/components/MobileSidebar";
import { ChatGPTVideoEditor } from "@/components/chatgpt/ChatGPTVideoEditor";

const ChatGPTVideo = () => {
  return (
    <MobileSidebar>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">ChatGPT Videos</h1>
        <p className="text-muted-foreground textContent">
          Create engaging videos using ChatGPT-generated content.
        </p>
        <ChatGPTVideoEditor />
      </div>
    </MobileSidebar>
  );
};

export default ChatGPTVideo;