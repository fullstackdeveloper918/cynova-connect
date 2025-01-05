import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ConversationForm } from "./ConversationForm";
import { ConversationPreview } from "./ConversationPreview";
import { Message } from "./types";

export const FakeTextGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [exporting, setExporting] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState("30");
  const { toast } = useToast();

  const generateConversation = async ({
    prompt,
    topic,
    duration,
    selectedVoice,
  }: {
    prompt: string;
    topic: string;
    duration: string;
    selectedVoice: string;
  }) => {
    if (!prompt || !topic) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields before generating.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setSelectedDuration(duration);
    try {
      const { data, error } = await supabase.functions.invoke('generate-fake-text', {
        body: { 
          prompt, 
          topic,
          duration: parseInt(duration),
          voiceId: selectedVoice
        },
      });

      if (error) throw error;

      const messagesWithAudio = data.messages.map((msg: Message) => ({
        ...msg,
        audioUrl: msg.audioUrl || null
      }));

      setMessages(messagesWithAudio);
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

  const exportVideo = async () => {
    if (!messages.length) {
      toast({
        title: "No conversation",
        description: "Please generate a conversation first.",
        variant: "destructive",
      });
      return;
    }

    setExporting(true);
    try {
      // Create a formatted script from the messages
      const script = messages.map(msg => 
        `${msg.isUser ? 'User' : 'Friend'}: ${msg.content}`
      ).join('\n');

      // Collect all audio URLs
      const audioUrls = messages
        .map(msg => msg.audioUrl)
        .filter((url): url is string => url !== null && url !== undefined);

      const { data, error } = await supabase.functions.invoke('export-video', {
        body: {
          messages,
          title: `iMessage Conversation: ${messages[0]?.content.substring(0, 30)}...`,
          description: script,
          type: 'fake_text',
          audioUrls
        },
      });

      if (error) throw error;

      toast({
        title: "Video exported!",
        description: "Your conversation video has been created and saved to your exports.",
      });
    } catch (error) {
      console.error('Error exporting video:', error);
      toast({
        title: "Export failed",
        description: "Failed to create video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <ConversationForm
          onGenerate={generateConversation}
          loading={loading}
        />
      </div>
      <div>
        <ConversationPreview
          messages={messages}
          onExport={exportVideo}
          exporting={exporting}
          duration={selectedDuration}
        />
      </div>
    </div>
  );
};