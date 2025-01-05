import { useState, useEffect } from "react";
import { VideoUploader } from "./VideoUploader";
import { VideoPreview } from "./VideoPreview";
import { SplitControls } from "./SplitControls";
import { VideoSegments } from "./VideoSegments";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCredits } from "@/hooks/useCredits";
import { useSubscription } from "@/hooks/useSubscription";

interface VideoSegment {
  start: number;
  end: number;
  name: string;
  status?: string;
  file_url?: string;
}

export const VideoSplitter = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [segments, setSegments] = useState<VideoSegment[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [tempVideoId, setTempVideoId] = useState<string | null>(null);
  
  const { credits, useCredit } = useCredits();
  const { data: subscription } = useSubscription();

  useEffect(() => {
    if (!tempVideoId) return;

    const pollInterval = setInterval(async () => {
      try {
        const { data: updatedSegments, error } = await supabase
          .from('video_segments')
          .select('*')
          .eq('temp_video_id', tempVideoId);

        if (error) throw error;

        if (updatedSegments) {
          setSegments(updatedSegments.map(s => ({
            name: s.name,
            start: Number(s.start_time),
            end: Number(s.end_time),
            status: s.status,
            file_url: s.file_url
          })));

          // Check if all segments are completed or failed
          const allDone = updatedSegments.every(s => 
            s.status === 'completed' || s.status === 'failed'
          );

          if (allDone) {
            clearInterval(pollInterval);
          }
        }
      } catch (error) {
        console.error('Error polling segments:', error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [tempVideoId]);

  const handleVideoUpload = async (file: File) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to upload videos",
          variant: "destructive",
        });
        return;
      }

      // Check plan limits
      const maxDuration = subscription?.plan_limits?.max_duration_minutes || 30;
      if (file.size > maxDuration * 60 * 1024 * 1024) { // Rough estimate: 1MB per second
        toast({
          title: "Video too long",
          description: `Your plan allows videos up to ${maxDuration} minutes`,
          variant: "destructive",
        });
        return;
      }

      setVideoFile(file);
      
      const { data, error } = await supabase
        .from('temp_videos')
        .insert({
          original_filename: file.name,
          file_size: file.size,
          status: 'pending',
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setTempVideoId(data.id);

      toast({
        title: "Video uploaded successfully",
        description: "You can now start splitting your video",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your video",
        variant: "destructive",
      });
    }
  };

  const handleAddSegment = (start: number, end: number, name: string) => {
    const newSegment = { start, end, name, status: 'pending' };
    setSegments([...segments, newSegment]);
    toast({
      title: "Segment added",
      description: `Added segment "${name}" from ${start}s to ${end}s`,
    });
  };

  const handleSplitVideo = async () => {
    if (!videoFile || segments.length === 0 || !tempVideoId) return;

    // Check if user has enough credits
    const creditsNeeded = segments.length;
    if (!credits || credits.credits_balance < creditsNeeded) {
      toast({
        title: "Insufficient credits",
        description: `You need ${creditsNeeded} credits to split this video. You have ${credits?.credits_balance || 0} credits.`,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');

      // Use credits
      await useCredit.mutateAsync({
        amount: creditsNeeded,
        description: `Split video into ${segments.length} segments`
      });

      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('segments', JSON.stringify(segments));
      formData.append('userId', user.id);
      formData.append('tempVideoId', tempVideoId);

      const { error } = await supabase.functions.invoke('split-video', {
        body: formData,
      });

      if (error) throw error;

      toast({
        title: "Video split started",
        description: "Your video segments are being processed. You'll see updates in real-time.",
      });

    } catch (error) {
      console.error('Split error:', error);
      toast({
        title: "Split failed",
        description: "There was an error splitting your video",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {!videoFile ? (
        <VideoUploader onUpload={handleVideoUpload} />
      ) : (
        <div className="space-y-6">
          <VideoPreview
            file={videoFile}
            onTimeUpdate={setCurrentTime}
            onDurationChange={setDuration}
          />
          <SplitControls
            currentTime={currentTime}
            duration={duration}
            onAddSegment={handleAddSegment}
            onSplitVideo={handleSplitVideo}
            isProcessing={isProcessing}
          />
          <VideoSegments segments={segments} />
        </div>
      )}
    </div>
  );
};
