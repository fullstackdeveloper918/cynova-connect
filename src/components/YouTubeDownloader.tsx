import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "./ui/use-toast";
import { Download, Link, Video } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface Quality {
  label: string;
  value: string;
  size: string;
}

export const YouTubeDownloader = () => {
  const [url, setUrl] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [thumbnail, setThumbnail] = useState("");

  const qualities: Quality[] = [
    { label: "1080p", value: "1080", size: "450 MB" },
    { label: "720p", value: "720", size: "250 MB" },
    { label: "480p", value: "480", size: "150 MB" },
    { label: "360p", value: "360", size: "100 MB" },
  ];

  const handlePreview = async () => {
    if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube video URL",
        variant: "destructive",
      });
      return;
    }

    try {
      // In a real implementation, this would fetch video metadata
      // For demo purposes, we'll simulate it
      setVideoTitle("Sample YouTube Video Title");
      setThumbnail("https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3");
      
      toast({
        title: "Video found",
        description: "Select your preferred quality to download.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not fetch video information. Please check the URL.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async () => {
    if (!selectedQuality) {
      toast({
        title: "Select quality",
        description: "Please select a video quality before downloading",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);
    try {
      // In a real implementation, this would call your backend API
      // For demo purposes, we'll show a success message
      toast({
        title: "Download started",
        description: `Downloading ${videoTitle} in ${selectedQuality}p...`,
      });
      
      // Simulate download delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      toast({
        title: "Download failed",
        description: "There was an error downloading your video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>YouTube Video Downloader</CardTitle>
          <CardDescription>
            Download YouTube videos in your preferred quality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Paste YouTube video URL here..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pr-10"
              />
              <Link className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
            <Button
              onClick={handlePreview}
              disabled={!url || isDownloading}
              variant="secondary"
            >
              <Video className="mr-2 h-4 w-4" />
              Preview
            </Button>
          </div>

          {videoTitle && (
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden">
                <img
                  src={thumbnail}
                  alt={videoTitle}
                  className="w-full h-48 object-cover"
                />
              </div>
              
              <div className="font-medium text-lg">{videoTitle}</div>

              <div className="flex gap-2">
                <Select
                  value={selectedQuality}
                  onValueChange={setSelectedQuality}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    {qualities.map((quality) => (
                      <SelectItem key={quality.value} value={quality.value}>
                        {quality.label} (~{quality.size})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={handleDownload}
                  disabled={!selectedQuality || isDownloading}
                  className="flex-1"
                >
                  {isDownloading ? (
                    <>
                      <Download className="mr-2 h-4 w-4 animate-bounce" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};