import { Card, CardContent } from "../ui/card";
import { Scissors, Download, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "../ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VideoSegment {
  start: number;
  end: number;
  name: string;
  status?: string;
  file_url?: string;
}

interface VideoSegmentsProps {
  segments: VideoSegment[];
}

export const VideoSegments = ({ segments }: VideoSegmentsProps) => {
  if (segments.length === 0) return null;

  const handleDownload = async (segment: VideoSegment) => {
    try {
      if (!segment.file_url) {
        toast({
          title: "Segment not ready",
          description: "Please wait for the segment to finish processing.",
          variant: "destructive",
        });
        return;
      }

      // If it's already a full URL, use it directly
      const downloadUrl = segment.file_url.startsWith('http') 
        ? segment.file_url 
        : supabase.storage.from('exports').getPublicUrl(segment.file_url).data.publicUrl;

      // Create a temporary anchor element to trigger the download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${segment.name}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download started",
        description: `Downloading segment: ${segment.name}`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "There was an error downloading your segment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
      case 'processing':
        return 'text-yellow-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Scissors className="h-5 w-5" />
        Segments ({segments.length})
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {segments.map((segment, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="font-medium mb-2">{segment.name}</div>
              <div className="text-sm text-muted-foreground mb-3">
                {segment.start.toFixed(2)}s - {segment.end.toFixed(2)}s
              </div>
              <div className="flex items-center justify-between">
                <div className={`text-sm font-medium ${getStatusColor(segment.status)}`}>
                  {segment.status === 'processing' && (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </span>
                  )}
                  {segment.status === 'completed' && 'Ready'}
                  {segment.status === 'failed' && 'Failed'}
                  {!segment.status && 'Pending'}
                </div>
                {segment.status === 'completed' && segment.file_url && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownload(segment)}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};