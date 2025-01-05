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
      
      const comments = data[1].data.children
        .filter((comment: any) => !comment.data.stickied)
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
      // Generate narration audio using ElevenLabs API
      const { data: audioData, error: audioError } = await supabase.functions.invoke("generate-video-preview", {
        body: { 
          script: content,
          voice: commentVoice,
          duration: selectedDuration
        }
      });

      if (audioError) throw audioError;

      setPreviewUrl("/stock/minecraft-gameplay.mp4");
      setAudioUrl(audioData.previewUrl.audioUrl);
      
      toast({
        title: "Video Generated",
        description: "Your video has been generated successfully.",
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
        />
      )}

      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Video...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Generate Video
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};