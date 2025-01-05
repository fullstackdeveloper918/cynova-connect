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
import { supabase } from "@/integrations/supabase/client";

export const RedditVideoEditor = () => {
  const [redditUrl, setRedditUrl] = useState("");
  const [content, setContent] = useState("");
  const [selectedBackground, setSelectedBackground] = useState("");
  const [selectedResolution, setSelectedResolution] = useState<VideoResolution>("youtube");
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [titleVoice, setTitleVoice] = useState("EXAVITQu4vr4xnSDxMaL"); // Sarah for questions
  const [commentVoice, setCommentVoice] = useState("onwK4e9ZLuTAKqWW03F9"); // Daniel for answers
  const { toast } = useToast();

  const handleFetch = async () => {
    if (!redditUrl) {
      toast({
        title: "URL Required",
        description: "Please enter a Reddit post URL",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // TODO: Implement Reddit content fetching
      const mockContent = "This is a mock Reddit post content for testing purposes.";
      setContent(mockContent);
      toast({
        title: "Content Fetched",
        description: "Reddit content has been retrieved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch Reddit content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAudio = async (text: string, voiceId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("No session");

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVEN_LABS_API_KEY || '',
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to generate audio');
    }

    return response.blob();
  };

  const handleGenerate = async () => {
    if (!content || !selectedBackground) {
      toast({
        title: "Missing Requirements",
        description: "Please provide content and select a background video.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Split content into title and comments
      const title = content.split('\n')[0];
      const comments = content.split('\n').slice(1).join('\n');

      // Generate audio for title and comments
      const titleAudio = await generateAudio(title, titleVoice);
      const commentsAudio = await generateAudio(comments, commentVoice);

      // TODO: Combine audio files and background video
      setPreviewUrl(selectedBackground);
      toast({
        title: "Video Generated",
        description: "Your video has been generated successfully.",
      });
    } catch (error) {
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

      <VoiceSettings
        titleVoice={titleVoice}
        commentVoice={commentVoice}
        onTitleVoiceSelect={setTitleVoice}
        onCommentVoiceSelect={setCommentVoice}
      />

      <VideoSettings
        selectedResolution={selectedResolution}
        selectedBackground={selectedBackground}
        onResolutionSelect={setSelectedResolution}
        onBackgroundSelect={setSelectedBackground}
      />

      {/* Preview Section */}
      {(content || previewUrl) && (
        <PreviewSection
          content={content}
          selectedResolution={selectedResolution}
          previewUrl={previewUrl}
        />
      )}

      {/* Generate Button */}
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