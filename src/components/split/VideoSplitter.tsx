import { useState } from "react";
import { VideoUploader } from "./VideoUploader";
import { VideoPreview } from "./VideoPreview";
import { SplitControls } from "./SplitControls";
import { VideoSegments } from "./VideoSegments";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VideoSegment {
  start: number;
  end: number;
  name: string;
}

export const VideoSplitter = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [segments, setSegments] = useState<VideoSegment[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const handleVideoUpload = async (file: File) => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to upload videos",
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
          user_id: user.id // Add the user_id here
        })
        .select()
        .single();

      if (error) throw error;

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
    setSegments([...segments, { start, end, name }]);
    toast({
      title: "Segment added",
      description: `Added segment "${name}" from ${start}s to ${end}s`,
    });
  };

  const handleSplitVideo = async () => {
    if (!videoFile || segments.length === 0) return;

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('segments', JSON.stringify(segments));

      const { data, error } = await supabase.functions.invoke('split-video', {
        body: formData,
      });

      if (error) throw error;

      toast({
        title: "Video split successfully",
        description: "Your video segments are being processed",
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