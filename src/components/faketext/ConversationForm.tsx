import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { VOICE_OPTIONS, DURATION_OPTIONS } from "./constants";

interface ConversationFormProps {
  onGenerate: (formData: {
    prompt: string;
    topic: string;
    duration: string;
    selectedVoice: string;
  }) => Promise<void>;
  loading: boolean;
}

export const ConversationForm = ({ onGenerate, loading }: ConversationFormProps) => {
  const [prompt, setPrompt] = useState("");
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState(DURATION_OPTIONS[0].value);
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].id);

  const handleSubmit = async () => {
    await onGenerate({
      prompt,
      topic,
      duration,
      selectedVoice,
    });
  };

  return (
    <div className="space-y-4">
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

      <Button 
        onClick={handleSubmit} 
        disabled={loading}
        className="w-full"
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
    </div>
  );
};