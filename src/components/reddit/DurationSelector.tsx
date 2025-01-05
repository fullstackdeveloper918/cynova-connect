import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DurationSelectorProps {
  selectedDuration: string;
  onDurationSelect: (duration: string) => void;
}

export const DurationSelector = ({
  selectedDuration,
  onDurationSelect,
}: DurationSelectorProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Video Duration</label>
      <Select value={selectedDuration} onValueChange={onDurationSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Select duration" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="30">30 seconds</SelectItem>
          <SelectItem value="60">60 seconds</SelectItem>
          <SelectItem value="90">90 seconds</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};