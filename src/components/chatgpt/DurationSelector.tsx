import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DurationSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export const DurationSelector = ({
  value,
  onChange,
}: DurationSelectorProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Video Duration</label>
      <Select value={value.toString()} onValueChange={(val) => onChange(Number(val))}>
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