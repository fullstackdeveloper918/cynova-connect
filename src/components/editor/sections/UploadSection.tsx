import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Link } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface UploadSectionProps {
  onVideoUpload: (file: File) => void;
}

export const UploadSection = ({ onVideoUpload }: UploadSectionProps) => {
  const [videoUrl, setVideoUrl] = useState("");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("video/")) {
        onVideoUpload(file);
        toast({
          title: "Video uploaded successfully",
          description: "You can now proceed to select a background.",
        });
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a video file.",
          variant: "destructive",
        });
      }
    }
  };

  const handleUrlSubmit = async () => {
    if (!videoUrl) return;

    try {
      // We'll implement the URL processing later
      toast({
        title: "Processing video URL",
        description: "Please wait while we process your video...",
      });
    } catch (error) {
      toast({
        title: "Error processing URL",
        description: "Please try again or upload a file directly.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Upload Video</h3>
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg border-muted hover:border-primary/50 transition-colors">
          <Upload className="w-12 h-12 mb-4 text-muted-foreground" />
          <Button variant="outline" className="relative">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            Choose Video
          </Button>
          <p className="mt-2 text-sm text-muted-foreground">
            Or drag and drop a video file
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Import from URL</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Paste YouTube or TikTok URL"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
          <Button variant="secondary" onClick={handleUrlSubmit}>
            <Link className="mr-2 h-4 w-4" />
            Import
          </Button>
        </div>
      </div>
    </div>
  );
};