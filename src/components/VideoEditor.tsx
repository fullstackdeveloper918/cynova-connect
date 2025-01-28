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
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const { data: userData } = useUser();

  const handleVideoUpload = async (file: File) => {
    if (file.type.startsWith("video/")) {
      setUserVideo(file);
      
      const videoUrl = URL.createObjectURL(file);
      const previewVideo = previewContainerRef.current?.querySelector('.user-video') as HTMLVideoElement;
      if (previewVideo) {
        previewVideo.src = videoUrl;
        previewVideo.load();
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
    
    const bgVideo = previewContainerRef.current?.querySelector('.background-video') as HTMLVideoElement;
    if (bgVideo) {
      bgVideo.src = `/stock/${videoId}-gameplay.mp4`;
      bgVideo.load();
      bgVideo.play().catch(console.error);
    }

    toast({
      title: "Background selected",
      description: `${videoId.toUpperCase()} gameplay footage will be added to your video.`,
    });
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
      // Create FormData to send both videos
      const formData = new FormData();
      formData.append('userVideo', userVideo);
      formData.append('backgroundId', selectedStock);
      formData.append('captions', captions);

      // Call the combine-videos edge function
      const { data: combinedVideoData, error: functionError } = await supabase.functions
        .invoke('combine-videos', {
          body: formData,
        });

      if (functionError) throw functionError;

      const { videoUrl, thumbnailUrl } = combinedVideoData;

      // Create export record
      const { data: exportData, error: exportError } = await supabase
        .from('exports')
        .insert({
          user_id: userData.id,
          title: userVideo.name,
          description: `Combined video with ${selectedStock} background`,
          file_url: videoUrl,
          thumbnail_url: thumbnailUrl || videoUrl,
          file_size: userVideo.size, // This will be updated by the edge function
          file_type: 'video/mp4',
          status: 'completed'
        })
        .select()
        .single();

      if (exportError) throw exportError;

      toast({
        title: "Export successful",
        description: "Your video has been processed and saved.",
      });

      // Trigger download
      const downloadLink = document.createElement("a");
      downloadLink.href = videoUrl;
      downloadLink.download = `combined_${userVideo.name}`;
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
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Editor Section */}
        <div className="space-y-4">
          <EditorTabs
            onVideoUpload={handleVideoUpload}
            onBackgroundSelect={handleStockSelection}
            onCaptionChange={setCaptions}
          />
        </div>

        {/* Preview Section */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Preview</h2>
          <div 
            ref={previewContainerRef}
            className="relative bg-white rounded-lg overflow-hidden w-full card-upload"
            style={{ aspectRatio: '9/16', maxHeight: '480px' }}
          >
            {!userVideo ? (
              <div className="absolute inset-0 flex items-center justify-center text-black/50">
                <Upload className="h-8 w-8 mr-2" />
                <span>Upload your video</span>
              </div>
            ) : (
              <>
                {/* Top half - User video */}
                <div className="absolute top-0 left-0 right-0 h-1/2 overflow-hidden">
                  <video
                    className="user-video w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
                
                {/* Bottom half - Background video */}
                <div className="absolute bottom-0 left-0 right-0 h-1/2 overflow-hidden">
                  {selectedStock ? (
                    <video
                      className="background-video w-full h-full object-cover"
                      autoPlay
                      loop
                      muted
                      playsInline
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white/50">
                      <Video className="h-6 w-6 mr-2" />
                      <span>Select background</span>
                    </div>
                  )}
                </div>

                {/* Captions overlay */}
                {captions && (
                  <div className="absolute bottom-4 left-0 right-0 p-4 text-center z-10">
                    <div className="bg-black/50 text-white p-2 rounded-lg inline-block text-sm">
                      {captions}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <Button
            onClick={handleExport}
            className="w-full mt-2 export-btn"
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