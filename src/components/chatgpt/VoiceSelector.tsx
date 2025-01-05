import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VoiceSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const VoiceSelector = ({
  value,
  onChange,
}: VoiceSelectorProps) => {
  const voices = [
    { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah (Professional Female)" },
    { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel (Professional Male)" },
    { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice (Casual Female)" },
    { id: "bIHbv24MWmeRgasZH58o", name: "Will (Casual Male)" },
  ];

  return (
    <Select value={value} onValueChange={onChange}>
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