import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Save, Loader2 } from "lucide-react";
import { VideoResolution } from "./ResolutionSelector";
import { ContentInput } from "./ContentInput";
import { VoiceSettings } from "./VoiceSettings";
import { VideoSettings } from "./VideoSettings";
import { PreviewSection } from "./PreviewSection";
import { CaptionStyle } from "./CaptionStyles";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const RedditVideoEditor = () => {
  const [redditUrl, setRedditUrl] = useState("");
  const [content, setContent] = useState("");
  const [selectedResolution, setSelectedResolution] = useState<VideoResolution>("shorts");
  const [selectedDuration, setSelectedDuration] = useState("30");
  const [selectedCaptionStyle, setSelectedCaptionStyle] = useState<CaptionStyle>("subtitles");
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [titleVoice, setTitleVoice] = useState("EXAVITQu4vr4xnSDxMaL");
  const [commentVoice, setCommentVoice] = useState("onwK4e9ZLuTAKqWW03F9");
  const { toast } = useToast();
  const navigate = useNavigate();

  const extractRedditPostId = (url: string) => {
    const matches = url.match(/comments\/([a-zA-Z0-9]+)/);
    return matches ? matches[1] : null;
  };

  const handleFetch = async () => {
    if (!redditUrl) {
      toast({
        title: "URL Required",
        description: "Please enter a Reddit post URL",
        variant: "destructive",
      });
      return;
    }

    const postId = extractRedditPostId(redditUrl);
    if (!postId) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Reddit post URL",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(`https://www.reddit.com/comments/${postId}.json`);
      if (!response.ok) {
        throw new Error('Failed to fetch Reddit content');
      }

      const data = await response.json();
      const post = data[0].data.children[0].data;
      
      // Calculate number of comments based on duration
      const commentsPerMinute = 4; // Adjust this value to control pacing
      const durationInMinutes = parseInt(selectedDuration) / 60;
      const targetCommentCount = Math.max(1, Math.round(commentsPerMinute * durationInMinutes));
      
      // Filter and format comments
      const comments = data[1].data.children
        .filter((comment: any) => !comment.data.stickied && comment.data.body)
        .slice(0, targetCommentCount)
        .map((comment: any) => comment.data.body)
        .join('\n\n');

      const formattedContent = `${post.title}\n\n${comments}`;
      setContent(formattedContent);
      
      toast({
        title: "Content Fetched",
        description: "Reddit content has been retrieved successfully.",
      });
    } catch (error) {
      console.error('Error fetching Reddit content:', error);
      toast({
        title: "Error",
        description: "Failed to fetch Reddit content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async () => {
    if (!content) {
      toast({
        title: "Missing Content",
        description: "Please fetch or enter content first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data: audioData, error: audioError } = await supabase.functions.invoke("generate-video-preview", {
        body: { 
          script: content,
          voice: commentVoice,
          duration: selectedDuration
        }
      });

      if (audioError) throw audioError;

      setPreviewUrl(audioData.previewUrl.videoUrl);
      setAudioUrl(audioData.previewUrl.audioUrl);
      
      toast({
        title: "Video Generated",
        description: "Your video preview is ready to watch.",
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async () => {
    if (!previewUrl) {
      toast({
        title: "No Preview Available",
        description: "Please generate a preview first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Get the current user's session
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session?.user?.id) {
        throw new Error('Authentication required');
      }

      const userId = session.user.id;

      // Create a project and export record
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: userId,
          title: content.split('\n')[0] || "Reddit Video",
          description: content,
          type: "reddit_video",
          thumbnail_url: previewUrl,
          video_url: previewUrl,
          status: 'completed'
        })
        .select()
        .single();

      if (projectError) throw projectError;

      const { error: exportError } = await supabase
        .from('exports')
        .insert({
          user_id: userId,
          project_id: projectData.id,
          title: content.split('\n')[0] || "Reddit Video",
          description: content,
          file_url: previewUrl,
          thumbnail_url: previewUrl,
          file_type: 'video/mp4',
          status: 'completed'
        });

      if (exportError) throw exportError;

      toast({
        title: "Export Successful",
        description: "Your video has been exported. Redirecting to exports page...",
      });

      // Navigate to exports page
      navigate('/dashboard/exports');
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <ContentInput
        redditUrl={redditUrl}
        content={content}
        isGenerating={isGenerating}
        onUrlChange={setRedditUrl}
        onContentChange={setContent}
        onFetch={handleFetch}
      />

      <VideoSettings
        selectedResolution={selectedResolution}
        selectedDuration={selectedDuration}
        selectedCaptionStyle={selectedCaptionStyle}
        onResolutionSelect={setSelectedResolution}
        onDurationSelect={setSelectedDuration}
        onCaptionStyleSelect={setSelectedCaptionStyle}
      />

      <VoiceSettings
        titleVoice={titleVoice}
        commentVoice={commentVoice}
        onTitleVoiceSelect={setTitleVoice}
        onCommentVoiceSelect={setCommentVoice}
      />

      {(content || previewUrl) && (
        <PreviewSection
          content={content}
          selectedResolution={selectedResolution}
          selectedCaptionStyle={selectedCaptionStyle}
          previewUrl={previewUrl}
          audioUrl={audioUrl}
          onExport={handleExport}
        />
      )}

      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={previewUrl ? handleExport : handleGenerate}
            disabled={isGenerating}
            className="w-full gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {previewUrl ? 'Exporting...' : 'Generating...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {previewUrl ? 'Export Video' : 'Generate Preview'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};