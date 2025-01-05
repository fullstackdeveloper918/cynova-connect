import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VoiceSelectorProps {
  selectedVoice: string;
  onVoiceSelect: (voice: string) => void;
}

export const VoiceSelector = ({
  selectedVoice,
  onVoiceSelect,
}: VoiceSelectorProps) => {
  const voices = [
    { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah (Professional Female)" },
    { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel (Professional Male)" },
    { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice (Casual Female)" },
    { id: "bIHbv24MWmeRgasZH58o", name: "Will (Casual Male)" },
  ];

  return (
    <Select value={selectedVoice} onValueChange={onVoiceSelect}>
      <SelectTrigger>
        <SelectValue placeholder="Select a voice" />
      </SelectTrigger>
      <SelectContent>
        {voices.map((voice) => (
          <SelectItem key={voice.id} value={voice.id}>
            {voice.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};