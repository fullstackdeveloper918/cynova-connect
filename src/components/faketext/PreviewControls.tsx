import { Button } from "@/components/ui/button";
import { Loader2, Sun, Moon, Video } from "lucide-react";

interface PreviewControlsProps {
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  onExport: () => Promise<void>;
  exporting: boolean;
}

export const PreviewControls = ({
  isDarkMode,
  setIsDarkMode,
  onExport,
  exporting,
}: PreviewControlsProps) => {
  return (
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold">Preview</h3>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="h-9 w-9"
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button onClick={onExport} disabled={exporting} variant="secondary">
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
      </div>
    </div>
  );
};