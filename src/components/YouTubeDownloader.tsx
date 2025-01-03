import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "./ui/use-toast";
import { Download, Link, AlertCircle, Video } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { VideoPreview } from "./youtube/VideoPreview";
import { Quality } from "./youtube/types";

export const YouTubeDownloader = () => {
  const [url, setUrl] = useState("");
  const [isDownloading, setIsDownloading] = useState("");
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
      const videoId = url.split("v=")[1]?.split("&")[0] || url.split("youtu.be/")[1];
      setVideoTitle("Loading YouTube video...");
      setThumbnail(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
      
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
      const { data, error } = await supabase.functions.invoke('download-youtube', {
        body: { url }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.message || data.error);
      }

      if (!data.videoUrl) {
        throw new Error('No video URL returned from the server');
      }

      // Download the video
      const response = await fetch(data.videoUrl);
      if (!response.ok) throw new Error('Failed to download video');
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element to trigger the download
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${data.title || 'youtube-video'}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(downloadUrl);

      toast({
        title: "Download started",
        description: "Your video download should begin shortly.",
      });
      
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: error.message || "There was an error downloading your video. Please try again.",
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
          <CardTitle className="text-2xl">YouTube Video Downloader</CardTitle>
          <CardDescription>
            Download YouTube videos in your preferred quality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Make sure to copy the video URL from YouTube
            </AlertDescription>
          </Alert>
          
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
              className="min-w-[120px]"
            >
              <Video className="mr-2 h-4 w-4" />
              Preview
            </Button>
          </div>

          <VideoPreview
            videoTitle={videoTitle}
            thumbnail={thumbnail}
            selectedQuality={selectedQuality}
            setSelectedQuality={setSelectedQuality}
            qualities={qualities}
          />

          {videoTitle && (
            <Button
              onClick={handleDownload}
              disabled={!selectedQuality || isDownloading}
              className="w-full"
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
          )}
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          Note: This tool is for personal use only. Please respect YouTube's terms of service.
        </CardFooter>
      </Card>
    </div>
  );
};