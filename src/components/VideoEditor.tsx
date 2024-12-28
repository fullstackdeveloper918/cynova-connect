import { useState } from "react";
import { Upload, Video, Save } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";

export const VideoEditor = () => {
  const [userVideo, setUserVideo] = useState<File | null>(null);
  const [selectedStock, setSelectedStock] = useState<string>("");
  const [captions, setCaptions] = useState<string>("");

  const stockVideos = [
    { id: "gta", name: "GTA V Gameplay", url: "/stock/gta-gameplay.mp4" },
    { id: "minecraft", name: "Minecraft Gameplay", url: "/stock/minecraft-gameplay.mp4" },
  ];

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("video/")) {
        setUserVideo(file);
        toast({
          title: "Video uploaded successfully",
          description: "You can now add stock footage and captions to your video.",
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

  const handleStockSelection = (videoId: string) => {
    setSelectedStock(videoId);
    toast({
      title: "Stock footage selected",
      description: `${videoId.toUpperCase()} gameplay footage will be added to your video.`,
    });
  };

  const handleExport = () => {
    // This is a placeholder for the actual export functionality
    toast({
      title: "Export started",
      description: "Your video is being processed. This may take a few minutes.",
    });
  };

  return (
    <div className="space-y-8 bg-accent/20 p-6 rounded-lg">
      {/* Video Upload Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Upload Your Video</h2>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="w-full max-w-xs relative">
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload className="mr-2 h-4 w-4" />
            Choose Video
          </Button>
          {userVideo && (
            <span className="text-sm text-muted-foreground">
              {userVideo.name}
            </span>
          )}
        </div>
      </div>

      {/* Stock Footage Selection */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Select Stock Footage</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stockVideos.map((video) => (
            <Button
              key={video.id}
              variant={selectedStock === video.id ? "default" : "outline"}
              className="h-auto py-4"
              onClick={() => handleStockSelection(video.id)}
            >
              <Video className="mr-2 h-4 w-4" />
              {video.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Captions Input */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Add Captions</h2>
        <textarea
          value={captions}
          onChange={(e) => setCaptions(e.target.value)}
          className="w-full h-32 p-3 rounded-md border border-input bg-background"
          placeholder="Enter your captions here..."
        />
      </div>

      {/* Export Button */}
      <Button
        onClick={handleExport}
        className="w-full max-w-xs"
        disabled={!userVideo || !selectedStock}
      >
        <Save className="mr-2 h-4 w-4" />
        Export Video
      </Button>
    </div>
  );
};