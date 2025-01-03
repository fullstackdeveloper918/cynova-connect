import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "./ui/use-toast";
import { Download, Link, AlertCircle } from "lucide-react";
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
      const { data, error } = await supabase.functions.invoke('download-tiktok', {
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
      a.download = `${data.title || 'tiktok-video'}.mp4`;
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
          <CardTitle className="text-2xl">TikTok Video Downloader</CardTitle>
          <CardDescription>
            Download TikTok videos without watermark by pasting the video URL below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Make sure to copy the video URL from the TikTok app or website
            </AlertDescription>
          </Alert>
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
        <CardFooter className="text-sm text-muted-foreground">
          Note: This tool is for personal use only. Please respect TikTok's terms of service.
        </CardFooter>
      </Card>
    </div>
  );
};