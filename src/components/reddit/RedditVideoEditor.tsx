import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Save, Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { VideoResolution } from "./ResolutionSelector";
import { ContentInput } from "./ContentInput";
import { VoiceSettings } from "./VoiceSettings";
import { VideoSettings } from "./VideoSettings";
import { PreviewSection } from "./PreviewSection";
import { CaptionStyle } from "./CaptionStyles";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const RedditVideoEditor = () => {
  const [activeTab, setActiveTab] = useState("content");
  const [redditUrl, setRedditUrl] = useState("");
  const [content, setContent] = useState("");
  const [selectedResolution, setSelectedResolution] = useState<VideoResolution>("shorts");
  const [selectedDuration, setSelectedDuration] = useState("30");
  const [selectedCaptionStyle, setSelectedCaptionStyle] = useState<CaptionStyle>("subtitles");
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [titleAudioUrl, setTitleAudioUrl] = useState("");
  const [commentAudioUrl, setCommentAudioUrl] = useState("");
  const [titleVoice, setTitleVoice] = useState("EXAVITQu4vr4xnSDxMaL");
  const [commentVoice, setCommentVoice] = useState("onwK4e9ZLuTAKqWW03F9");
  const { toast } = useToast();
  const navigate = useNavigate();

  const extractRedditPostId = (url: string) => {
    const matches = url.match(/comments\/([a-zA-Z0-9]+)/);
    return matches ? matches[1] : null;
  };

  const handleGenerate = async (contentToGenerate: string) => {
    if (!contentToGenerate) {
      toast({
        title: "Missing Content",
        description: "Please fetch or enter content first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Split content into title and comments
      const [title, ...comments] = contentToGenerate.split('\n\n');
      const commentsText = comments.join('\n\n');

      console.log('Generating title audio with Sarah voice:', { title });
      // Generate audio for title with Sarah's voice
      const { data: titleAudioData, error: titleAudioError } = await supabase.functions.invoke("generate-video-preview", {
        body: { 
          script: title,
          voice: titleVoice,
          duration: "10" // Shorter duration for title
        }
      });

      if (titleAudioError) throw titleAudioError;

      console.log('Generating comments audio with Daniel voice:', { commentsText });
      // Generate audio for comments with Daniel's voice
      const { data: commentAudioData, error: commentAudioError } = await supabase.functions.invoke("generate-video-preview", {
        body: { 
          script: commentsText,
          voice: commentVoice,
          duration: selectedDuration
        }
      });

      if (commentAudioError) throw commentAudioError;

      // Store both audio URLs
      setTitleAudioUrl(titleAudioData.previewUrl.audioUrl);
      setCommentAudioUrl(commentAudioData.previewUrl.audioUrl);
      setPreviewUrl(commentAudioData.previewUrl.videoUrl);
      setAudioUrl(commentAudioData.previewUrl.audioUrl);
      
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

  const handleFetch = async () => {
    if (!redditUrl) {
      toast({
        title: "URL Required",
        description: "Please enter a Reddit post URL",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDuration) {
      toast({
        title: "Duration Required",
        description: "Please select a video duration",
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
      // Average reading speed is about 150 words per minute
      // We want to fill the entire duration with content
      const durationInMinutes = parseInt(selectedDuration) / 60;
      const targetWordCount = Math.round(150 * durationInMinutes);
      
      // Title takes about 5-8 seconds to read
      const titleWordCount = post.title.split(/\s+/).length;
      const remainingWordCount = targetWordCount - titleWordCount;
      
      // Filter and format comments to match target duration
      let currentWordCount = 0;
      const selectedComments = [];
      
      for (const comment of data[1].data.children) {
        if (!comment.data.stickied && comment.data.body) {
          const commentWords = comment.data.body.split(/\s+/).length;
          if (currentWordCount + commentWords <= remainingWordCount) {
            selectedComments.push(comment.data.body);
            currentWordCount += commentWords;
          }
          if (currentWordCount >= remainingWordCount) break;
        }
      }

      // If we don't have enough comments, add more from deeper in the thread
      if (currentWordCount < remainingWordCount && data[1].data.children.length > 0) {
        for (const comment of data[1].data.children) {
          if (comment.data.replies && comment.data.replies.data && comment.data.replies.data.children) {
            for (const reply of comment.data.replies.data.children) {
              if (reply.data && reply.data.body) {
                const replyWords = reply.data.body.split(/\s+/).length;
                if (currentWordCount + replyWords <= remainingWordCount) {
                  selectedComments.push(reply.data.body);
                  currentWordCount += replyWords;
                }
                if (currentWordCount >= remainingWordCount) break;
              }
            }
            if (currentWordCount >= remainingWordCount) break;
          }
        }
      }

      const formattedContent = `${post.title}\n\n${selectedComments.join('\n\n')}`;
      console.log(`Generated content with approximately ${formattedContent.split(/\s+/).length} words for ${selectedDuration} seconds duration`);
      
      setContent(formattedContent);
      
      // Automatically generate preview after fetching content
      await handleGenerate(formattedContent);
      
      toast({
        title: "Content Fetched",
        description: `Reddit content has been retrieved and optimized for ${selectedDuration} seconds.`,
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

  const handleNext = () => {
    if (activeTab === "content" && content) {
      setActiveTab("settings");
    } else if (activeTab === "settings") {
      setActiveTab("preview");
    }
  };

  const handleBack = () => {
    if (activeTab === "preview") {
      setActiveTab("settings");
    } else if (activeTab === "settings") {
      setActiveTab("content");
    }
  };

  return (
    <div className="space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 tabs-title">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-6">
          <ContentInput
            redditUrl={redditUrl}
            content={content}
            isGenerating={isGenerating}
            selectedDuration={selectedDuration}
            onUrlChange={setRedditUrl}
            onContentChange={setContent}
            onDurationChange={setSelectedDuration}
            onFetch={handleFetch}
          />
          {content && (
            <div className="flex justify-end mt-4">
              <Button onClick={() => setActiveTab("settings")}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <div className="space-y-6">
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
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleNext}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          {(content || previewUrl) && (
            <PreviewSection
              content={content}
              selectedResolution={selectedResolution}
              selectedCaptionStyle={selectedCaptionStyle}
              previewUrl={previewUrl}
              titleAudioUrl={titleAudioUrl}
              commentAudioUrl={commentAudioUrl}
              onExport={handleExport}
            />
          )}
          <div className="flex justify-start mt-4">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {activeTab === "preview" && (
        <Card className="bg-white hover:shadow-lg">
          <CardContent className="pt-6">
            <Button
              onClick={previewUrl ? handleExport : () => handleGenerate(content)}
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
      )}
    </div>
  );
};