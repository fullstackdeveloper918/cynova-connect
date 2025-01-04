import { Textarea } from "@/components/ui/textarea";

interface ScriptEditorProps {
  script: string;
  onScriptChange: (script: string) => void;
}

export const ScriptEditor = ({ script, onScriptChange }: ScriptEditorProps) => {
  return (
    <Textarea
      value={script}
      onChange={(e) => onScriptChange(e.target.value)}
      className="h-48 font-mono"
      placeholder="Your script will appear here..."
    />
  );
};