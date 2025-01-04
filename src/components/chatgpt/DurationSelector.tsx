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
          <SelectItem value="24">1 second</SelectItem>
          <SelectItem value="48">2 seconds</SelectItem>
          <SelectItem value="72">3 seconds</SelectItem>
          <SelectItem value="96">4 seconds</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};