import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "./ui/use-toast";
import { Download, Link } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export const TikTokDownloader = () => {
  const [url, setUrl] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!url.includes("tiktok.com")) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid TikTok video URL",
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
        description: "Your video will be downloaded shortly.",
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
          <CardTitle>TikTok Video Downloader</CardTitle>
          <CardDescription>
            Download TikTok videos by pasting the video URL below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Paste TikTok video URL here..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pr-10"
              />
              <Link className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
            <Button
              onClick={handleDownload}
              disabled={!url || isDownloading}
              className="min-w-[120px]"
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
        </CardContent>
      </Card>
    </div>
  );
};