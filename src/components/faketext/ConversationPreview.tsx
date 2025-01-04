import { Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Message } from "./types";
import { MessageBubble } from "./MessageBubble";

interface ConversationPreviewProps {
  messages: Message[];
  onExport: () => Promise<void>;
  exporting: boolean;
}

export const ConversationPreview = ({ messages, onExport, exporting }: ConversationPreviewProps) => {
  if (!messages.length) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Preview</h3>
        <Button 
          onClick={onExport}
          disabled={exporting}
          variant="secondary"
        >
          {exporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Video className="mr-2 h-4 w-4" />
              Export as Video
            </>
          )}
        </Button>
      </div>

      <div className="bg-[#F5F5F5] rounded-lg p-4 space-y-4 border border-accent">
        <div className="text-center text-sm text-gray-500 pb-2">
          Today
        </div>
        {messages.map((message, index) => (
          <MessageBubble
            key={index}
            message={message.content}
            isUser={message.isUser}
            timestamp={message.timestamp}
          />
        ))}
      </div>
    </div>
  );
};