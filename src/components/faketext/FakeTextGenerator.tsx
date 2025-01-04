import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageBubble } from "./MessageBubble";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Video } from "lucide-react";

interface Message {
  content: string;
  sender: string;
  timestamp: string;
  isUser: boolean;
}

const VOICE_OPTIONS = [
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah - Professional" },
  { id: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam - Friendly" },
  { id: "XB0fDUnXU5powFXDhCwa", name: "Charlotte - Casual" },
];

const DURATION_OPTIONS = [
  { value: "30", label: "30 seconds" },
  { value: "60", label: "1 minute" },
  { value: "90", label: "1.5 minutes" },
];

export const FakeTextGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].id);
  const [duration, setDuration] = useState(DURATION_OPTIONS[0].value);
  const [exporting, setExporting] = useState(false);
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
        body: { 
          prompt, 
          topic,
          duration: parseInt(duration), // Pass duration to control conversation length
        },
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
      const { data, error } = await supabase.functions.invoke('export-video', {
        body: {
          messages,
          voiceId: selectedVoice,
          title: topic,
          description: prompt,
        },
      });

      if (error) throw error;

      toast({
        title: "Video exported!",
        description: "Your video has been created and saved to your exports.",
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
          <Label htmlFor="duration">Conversation Duration</Label>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              {DURATION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="voice">Narration Voice</Label>
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger>
              <SelectValue placeholder="Select voice" />
            </SelectTrigger>
            <SelectContent>
              {VOICE_OPTIONS.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  {voice.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

        <div className="flex gap-2">
          <Button 
            onClick={generateConversation} 
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Conversation"
            )}
          </Button>

          {messages.length > 0 && (
            <Button 
              onClick={exportVideo}
              disabled={exporting}
              variant="secondary"
              className="flex-1"
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
          )}
        </div>
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