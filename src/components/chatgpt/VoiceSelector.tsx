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
    { id: "Sarah", name: "Sarah (Professional Female)" },
    { id: "Daniel", name: "Daniel (Professional Male)" },
    { id: "Emily", name: "Emily (Casual Female)" },
    { id: "Michael", name: "Michael (Casual Male)" },
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