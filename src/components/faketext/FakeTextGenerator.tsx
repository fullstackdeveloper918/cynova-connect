import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageBubble } from "./MessageBubble";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  content: string;
  sender: string;
  timestamp: string;
  isUser: boolean;
}

export const FakeTextGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();

  const generateConversation = async () => {
    if (!prompt || !topic) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields before generating.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-fake-text', {
        body: { prompt, topic },
      });

      if (error) throw error;

      setMessages(data.messages);
      toast({
        title: "Conversation generated!",
        description: "Your iMessage conversation has been created.",
      });
    } catch (error) {
      console.error('Error generating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to generate conversation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="topic">Conversation Topic</Label>
          <Input
            id="topic"
            placeholder="E.g., Planning a surprise party"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="prompt">Additional Details</Label>
          <Textarea
            id="prompt"
            placeholder="Add more context about the conversation, participants, or specific details you want to include..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <Button 
          onClick={generateConversation} 
          disabled={loading}
          className="w-full"
        >
          {loading ? "Generating..." : "Generate Conversation"}
        </Button>
      </div>

      {messages.length > 0 && (
        <div className="bg-[#F5F5F5] rounded-lg p-4 space-y-4">
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
      )}
    </div>
  );
};