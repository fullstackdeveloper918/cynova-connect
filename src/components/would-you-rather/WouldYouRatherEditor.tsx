import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/hooks/useUser";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VideoPreview } from "../chatgpt/VideoPreview";

export const WouldYouRatherEditor = () => {
  const { data: user, isLoading: userLoading } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("21m00Tcm4TlvDq8ikWAM");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<{ audioUrl: string; videoUrl?: string } | null>(null);
  const [script, setScript] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is authenticated
    if (!user || userLoading) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a video",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Generating video content...");
      
      // Generate video content with narration and images
      const { data: videoData, error: videoError } = await supabase.functions.invoke(
        "generate-would-you-rather",
        {
          body: {
            optionA,
            optionB,
            voiceId: selectedVoice,
          },
        }
      );

      if (videoError) throw videoError;

      setPreviewUrl({
        audioUrl: videoData.audioUrl,
        videoUrl: videoData.videoUrl
      });
      setScript(videoData.script);

      // Create project
      console.log("Creating project with user ID:", user.id);
      
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          title: "Would You Rather Video",
          type: "would_you_rather",
          user_id: user.id,
          description: `Would you rather ${optionA} OR ${optionB}?`,
          status: "draft"
        })
        .select()
        .single();

      if (projectError) {
        console.error("Project creation error:", projectError);
        throw projectError;
      }

      if (!project) {
        throw new Error("No project data returned");
      }

      console.log("Project created successfully:", project);

      // Create the would you rather question
      const { error: questionError } = await supabase
        .from("would_you_rather_questions")
        .insert({
          project_id: project.id,
          user_id: user.id,
          option_a: optionA,
          option_b: optionB,
        });

      if (questionError) {
        console.error("Question creation error:", questionError);
        throw questionError;
      }

      toast({
        title: "Success",
        description: "Your Would You Rather video has been created!",
      });

    } catch (error) {
      console.error("Error creating would you rather video:", error);
      toast({
        title: "Error",
        description: "Failed to create video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Options</h2>
            <div>
              <label className="block text-sm font-medium mb-2">
                Would you rather...
              </label>
              <Input
                placeholder="Option A"
                value={optionA}
                onChange={(e) => setOptionA(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">OR</label>
              <Input
                placeholder="Option B"
                value={optionB}
                onChange={(e) => setOptionB(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Voice</label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="21m00Tcm4TlvDq8ikWAM">Rachel (Female)</SelectItem>
                  <SelectItem value="AZnzlk1XvdvUeBnXmlld">Domi (Female)</SelectItem>
                  <SelectItem value="EXAVITQu4vr4xnSDxMaL">Bella (Female)</SelectItem>
                  <SelectItem value="ErXwobaYiN019PkySvjV">Antoni (Male)</SelectItem>
                  <SelectItem value="MF3mGyEYCl7XYWbV9V6O">Elli (Female)</SelectItem>
                  <SelectItem value="TxGEqnHWrfWFTfGW9XjX">Josh (Male)</SelectItem>
                  <SelectItem value="VR6AewLTigWG4xSOukaG">Arnold (Male)</SelectItem>
                  <SelectItem value="pNInz6obpgDQGcFmaJgB">Adam (Male)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" disabled={isSubmitting || userLoading}>
            {isSubmitting ? "Creating..." : "Create Video"}
          </Button>
        </form>
      </Card>
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Preview</h2>
          <div className="aspect-[9/16] w-full max-w-[450px] mx-auto">
            {previewUrl ? (
              <VideoPreview
                script={script}
                previewUrl={previewUrl}
                selectedVoice={selectedVoice}
              />
            ) : (
              <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Video preview will appear here</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};