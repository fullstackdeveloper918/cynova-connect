import { Card, CardContent } from "../ui/card";
import { Scissors, Download, Loader2, Play } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GameplaySelector } from "./GameplaySelector";
import { useState } from "react";

interface VideoSegment {
  start: number;
  end: number;
  name: string;
  status?: string;
  file_url?: string;
  gameplay_url?: string;
  combined_url?: string;
  is_combined?: boolean;
}

interface VideoSegmentsProps {
  segments: VideoSegment[];
}

export const VideoSegments = ({ segments }: VideoSegmentsProps) => {
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  if (segments.length === 0) return null;

  const handleDownload = async (segment: VideoSegment) => {
    try {
      // Prefer combined URL if available
      const downloadUrl = segment.combined_url || segment.file_url;
      
      if (!downloadUrl) {
        toast({
          title: "Segment not ready",
          description: "Please wait for the segment to finish processing.",
          variant: "destructive",
        });
        return;
      }

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

  const handleGameplaySelect = async (segmentName: string, gameplayUrl: string) => {
    setSelectedSegment(segmentName);
    
    try {
      const { data: segmentData, error: segmentError } = await supabase
        .from('video_segments')
        .update({
          gameplay_url: gameplayUrl,
          status: 'processing'
        })
        .eq('name', segmentName)
        .select()
        .single();

      if (segmentError) throw segmentError;

      toast({
        title: "Processing video",
        description: "Combining gameplay with your segment. This may take a moment.",
      });

      // Trigger the edge function to combine videos
      const response = await supabase.functions.invoke('combine-videos', {
        body: {
          segmentId: segmentData.id,
          gameplayUrl,
        },
      });

      if (!response.error) {
        toast({
          title: "Success",
          description: "Gameplay has been added to your segment.",
        });
      } else {
        throw new Error('Failed to combine videos');
      }
    } catch (error) {
      console.error('Error adding gameplay:', error);
      toast({
        title: "Error",
        description: "Failed to add gameplay to segment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSelectedSegment(null);
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
                {segment.status === 'completed' && (segment.file_url || segment.combined_url) && (
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

              {/* Gameplay Selection */}
              {segment.status === 'completed' && !segment.is_combined && (
                <div className="mt-4">
                  <GameplaySelector
                    onSelect={(url) => handleGameplaySelect(segment.name, url)}
                    selectedUrl={segment.gameplay_url}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};