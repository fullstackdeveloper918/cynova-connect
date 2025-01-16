import { useState, useRef, useEffect } from "react";
import { Upload, Video, Save } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";
import { EditorTabs } from "./editor/EditorTabs";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/hooks/useUser";

export const VideoEditor = () => {
  const [userVideo, setUserVideo] = useState<File | null>(null);
  const [selectedStock, setSelectedStock] = useState<string>("");
  const [captions, setCaptions] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const { data: userData } = useUser();

  const handleVideoUpload = async (file: File) => {
    if (file.type.startsWith("video/")) {
      setUserVideo(file);
      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(newPreviewUrl);
      
      if (videoPreviewRef.current) {
        videoPreviewRef.current.src = newPreviewUrl;
        videoPreviewRef.current.load();
      }

      toast({
        title: "Video uploaded successfully",
        description: "You can now add background and captions.",
      });
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a video file.",
        variant: "destructive",
      });
    }
  };

  const handleStockSelection = (videoId: string) => {
    setSelectedStock(videoId);
    
    if (videoPreviewRef.current) {
      const stockVideo = `/stock/${videoId}-gameplay.mp4`;
      // We don't change the source, we'll handle the background in CSS
      toast({
        title: "Background selected",
        description: `${videoId.toUpperCase()} gameplay footage will be added to your video.`,
      });
    }
  };

  const handleExport = async () => {
    if (!userVideo || !selectedStock || !userData?.id) {
      toast({
        title: "Missing requirements",
        description: "Please upload a video and select background footage before exporting.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      const fileExt = userVideo.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('exports')
        .upload(fileName, userVideo);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('exports')
        .getPublicUrl(fileName);

      const { data: exportData, error: exportError } = await supabase
        .from('exports')
        .insert({
          user_id: userData.id,
          title: userVideo.name,
          description: `Video with ${selectedStock} background`,
          file_url: publicUrl,
          thumbnail_url: publicUrl,
          file_size: userVideo.size,
          file_type: userVideo.type,
          status: 'completed'
        })
        .select()
        .single();

      if (exportError) throw exportError;

      toast({
        title: "Export successful",
        description: "Your video has been processed and saved.",
      });

      const downloadLink = document.createElement("a");
      downloadLink.href = publicUrl;
      downloadLink.download = `edited_${userVideo.name}`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "There was an error processing your video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Editor Section */}
        <div className="space-y-4">
          <EditorTabs
            onVideoUpload={handleVideoUpload}
            onBackgroundSelect={handleStockSelection}
            onCaptionChange={setCaptions}
          />
        </div>

        {/* Preview Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Preview</h2>
          <div className="relative w-full" style={{ aspectRatio: '9/16' }}>
            <div className="absolute inset-0 bg-black rounded-lg overflow-hidden">
              {userVideo ? (
                <>
                  {/* Top half - User video */}
                  <div className="absolute top-0 left-0 right-0 h-1/2 overflow-hidden">
                    <video
                      ref={videoPreviewRef}
                      className="w-full h-full object-cover"
                      controls
                      playsInline
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  
                  {/* Bottom half - Background video */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/2 overflow-hidden">
                    {selectedStock ? (
                      <video
                        src={`/stock/${selectedStock}-gameplay.mp4`}
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white/50">
                        <Video className="h-8 w-8 mr-2" />
                        <span>Select background</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white/50">
                  <Upload className="h-12 w-12 mr-2" />
                  <span>Upload your video</span>
                </div>
              )}

              {captions && (
                <div className="absolute bottom-4 left-0 right-0 p-4 text-center z-10">
                  <div className="bg-black/50 text-white p-2 rounded-lg inline-block text-sm">
                    {captions}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={handleExport}
            className="w-full"
            disabled={!userVideo || !selectedStock || isExporting}
          >
            {isExporting ? (
              <>
                <Save className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Export Video
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};