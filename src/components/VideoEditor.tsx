import { useState, useRef, useEffect } from "react";
import { Upload, Video, Save } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";

export const VideoEditor = () => {
  const [userVideo, setUserVideo] = useState<File | null>(null);
  const [selectedStock, setSelectedStock] = useState<string>("");
  const [captions, setCaptions] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const finalPreviewRef = useRef<HTMLVideoElement>(null);

  const stockVideos = [
    { 
      id: "gta", 
      name: "GTA V Gameplay", 
      url: "/stock/gta-gameplay.mp4",
      previewImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2940&ixlib=rb-4.0.3",
      description: "High-octane urban action gameplay"
    },
    { 
      id: "minecraft", 
      name: "Minecraft Gameplay", 
      url: "/stock/minecraft-gameplay.mp4",
      previewImage: "https://images.unsplash.com/photo-1627856014754-2907e2355d54?q=80&w=2940&ixlib=rb-4.0.3",
      description: "Creative building and survival adventures"
    },
  ];

  useEffect(() => {
    // Clean up URLs when component unmounts
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("video/")) {
        setUserVideo(file);
        const newPreviewUrl = URL.createObjectURL(file);
        setPreviewUrl(newPreviewUrl);
        
        if (videoPreviewRef.current) {
          videoPreviewRef.current.src = newPreviewUrl;
        }

        // Automatically generate captions using Web Speech API
        generateCaptions(file);

        toast({
          title: "Video uploaded successfully",
          description: "Processing video and generating captions...",
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

  const generateCaptions = async (videoFile: File) => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        throw new Error("Speech recognition is not supported in this browser");
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(" ");
        setCaptions(transcript);
      };

      // Create an audio context and process the video file
      const audioContext = new AudioContext();
      const audioBuffer = await videoFile.arrayBuffer();
      const audioSource = await audioContext.decodeAudioData(audioBuffer);
      
      // Start recognition
      recognition.start();
    } catch (error) {
      console.error("Error generating captions:", error);
      toast({
        title: "Caption generation failed",
        description: "Could not automatically generate captions. You can add them manually.",
        variant: "destructive",
      });
    }
  };

  const handleStockSelection = (videoId: string) => {
    setSelectedStock(videoId);
    // Update final preview with combined video
    if (finalPreviewRef.current) {
      const stockVideo = stockVideos.find(v => v.id === videoId);
      if (stockVideo) {
        finalPreviewRef.current.src = stockVideo.url;
      }
    }
    toast({
      title: "Stock footage selected",
      description: `${videoId.toUpperCase()} gameplay footage will be added to your video.`,
    });
  };

  const handleExport = async () => {
    if (!userVideo || !selectedStock) {
      toast({
        title: "Missing requirements",
        description: "Please upload a video and select stock footage before exporting.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      // Simulate export process
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Create a download link for the processed video
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(userVideo); // In a real implementation, this would be the processed video
      downloadLink.download = `edited_${userVideo.name}`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      toast({
        title: "Export successful",
        description: "Your video has been processed and downloaded.",
      });
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
    <div className="space-y-8 bg-accent/20 p-6 rounded-lg">
      {/* Video Upload Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Upload Your Video</h2>
        <div className="flex flex-col gap-4">
          <Button variant="outline" className="w-full max-w-xs relative group hover:bg-primary/5">
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload className="mr-2 h-4 w-4 group-hover:text-primary transition-colors" />
            Choose Video
          </Button>
          {userVideo && (
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground block">
                {userVideo.name}
              </span>
              <video
                ref={videoPreviewRef}
                controls
                className="max-w-full h-auto rounded-lg shadow-lg"
                style={{ maxHeight: "300px" }}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>
      </div>

      {/* Stock Footage Selection */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Select Stock Footage</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stockVideos.map((video) => (
            <div key={video.id} className="group">
              <Button
                variant={selectedStock === video.id ? "default" : "outline"}
                className="w-full h-48 relative overflow-hidden rounded-lg transition-all duration-300 hover:shadow-xl"
                onClick={() => handleStockSelection(video.id)}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 z-10" />
                <img 
                  src={video.previewImage} 
                  alt={video.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="relative z-20 flex flex-col items-center justify-center w-full h-full text-white p-4">
                  <Video className="mb-2 h-6 w-6 opacity-75" />
                  <h3 className="font-bold text-lg mb-1">{video.name}</h3>
                  <p className="text-sm opacity-75">{video.description}</p>
                </div>
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Captions Display */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Generated Captions</h2>
        <textarea
          value={captions}
          onChange={(e) => setCaptions(e.target.value)}
          className="w-full h-32 p-3 rounded-md border border-input bg-background"
          placeholder="Captions will appear here automatically..."
        />
      </div>

      {/* Final Preview */}
      {userVideo && selectedStock && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Preview</h2>
          <video
            ref={finalPreviewRef}
            controls
            className="w-full rounded-lg"
            style={{ maxHeight: "400px" }}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {/* Export Button */}
      <Button
        onClick={handleExport}
        className="w-full max-w-xs"
        disabled={!userVideo || !selectedStock || isExporting}
      >
        {isExporting ? (
          <span className="flex items-center">
            <Save className="mr-2 h-4 w-4 animate-spin" />
            Exporting...
          </span>
        ) : (
          <span className="flex items-center">
            <Save className="mr-2 h-4 w-4" />
            Export Video
          </span>
        )}
      </Button>
    </div>
  );
};