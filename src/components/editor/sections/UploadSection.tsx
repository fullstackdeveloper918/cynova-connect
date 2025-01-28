import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Link } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UploadSectionProps {
  onVideoUpload: (file: File | string) => void;
}

export const UploadSection = ({ onVideoUpload }: UploadSectionProps) => {
  const [videoUrl, setVideoUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("video/")) {
        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${crypto.randomUUID()}.${fileExt}`;
          
          const { data, error } = await supabase.storage
            .from('exports')
            .upload(fileName, file);

          if (error) throw error;

          const { data: { publicUrl } } = supabase.storage
            .from('exports')
            .getPublicUrl(fileName);

          onVideoUpload(file);
          toast({
            title: "Video uploaded successfully",
            description: "You can now proceed to select a background.",
          });
        } catch (error) {
          console.error('Upload error:', error);
          toast({
            title: "Upload failed",
            description: "There was an error uploading your video. Please try again.",
            variant: "destructive",
          });
        }
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

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('download-youtube', {
        body: { url: videoUrl }
      });

      if (error) throw error;

      onVideoUpload(data.videoUrl);
      toast({
        title: "Video imported successfully",
        description: "You can now proceed to select a background.",
      });
    } catch (error) {
      console.error('URL processing error:', error);
      toast({
        title: "Import failed",
        description: "Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Upload Video</h3>
        <Card className="card-wrap p-6 hover:shadow-lg">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Upload className="w-12 h-12 text-muted-foreground" />
            <Button variant="outline" className="relative">
              <input
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              Choose Video
            </Button>
            <p className="text-xs text-muted-foreground">
              Or drag and drop a video file
            </p>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Import from URL</h3>
        <Card className="p-6 card-wrap hover:shadow-lg">
          <div className="flex flex-col space-y-4">
            <Input
              placeholder="Paste YouTube or TikTok URL"
              className="card-input"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
            <Button 
              variant="secondary" 
              onClick={handleUrlSubmit}
              disabled={isProcessing}
            >
              <Link className="mr-2 h-4 w-4" />
              {isProcessing ? "Processing..." : "Import"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};