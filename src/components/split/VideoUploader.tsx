import { Upload } from "lucide-react";
import { Button } from "../ui/button";

interface VideoUploaderProps {
  onUpload: (file: File) => void;
}

export const VideoUploader = ({ onUpload }: VideoUploaderProps) => {
  return (
    <div className="border-2 border-dashed border-border rounded-lg p-12 text-center bg-white hover:shadow-lg">
      <div className="space-y-4">
        <div className="flex justify-center">
          <Upload className="h-12 w-12 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Upload a video</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Drag and drop or click to select a video file
          </p>
        </div>
        <Button variant="outline" className="relative">
          <input
            type="file"
            accept="video/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          Select Video
        </Button>
      </div>
    </div>
  );
};