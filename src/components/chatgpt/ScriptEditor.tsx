import { Textarea } from "@/components/ui/textarea";

interface ScriptEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const ScriptEditor = ({ value, onChange }: ScriptEditorProps) => {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-48 font-mono"
      placeholder="Your script will appear here..."
    />
  );
};