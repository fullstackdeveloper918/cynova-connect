import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export const UploadSection = () => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg border-muted">
        <Upload className="w-12 h-12 mb-4 text-muted-foreground" />
        <Button variant="outline" className="relative">
          <input
            type="file"
            accept="video/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          Choose Video
        </Button>
        <p className="mt-2 text-sm text-muted-foreground">
          Or drag and drop a video file
        </p>
      </div>
    </div>
  );
};