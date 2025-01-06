import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/hooks/useUser";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { QuestionGenerationForm } from "./QuestionGenerationForm";
import { QuestionForm } from "./QuestionForm";
import { VideoPreviewSection } from "./VideoPreviewSection";
import { generateVideo } from "./VideoGenerationService";

export const WouldYouRatherEditor = () => {
  const { data: user, isLoading: userLoading } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Array<{ optionA: string; optionB: string }>>([{ optionA: "", optionB: "" }]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState("21m00Tcm4TlvDq8ikWAM");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<Array<{ audioUrl: string; videoUrl?: string } | null>>([]);
  const [scripts, setScripts] = useState<string[]>([]);
  const [currentProcessingIndex, setCurrentProcessingIndex] = useState<number | null>(null);

  const handleQuestionsGenerated = (newQuestions: Array<{ optionA: string; optionB: string }>) => {
    setQuestions(newQuestions);
    setSelectedQuestionIndex(0);
    setPreviewUrls(new Array(newQuestions.length).fill(null));
    setScripts(new Array(newQuestions.length).fill(""));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id || userLoading) {
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
      for (let i = 0; i < questions.length; i++) {
        setCurrentProcessingIndex(i);
        const currentQuestion = questions[i];
        
        const { videoData } = await generateVideo(
          currentQuestion.optionA,
          currentQuestion.optionB,
          selectedVoice,
          user.id
        );

        const newPreviewUrls = [...previewUrls];
        newPreviewUrls[i] = {
          audioUrl: videoData.audioUrl,
          videoUrl: videoData.videoUrl
        };
        setPreviewUrls(newPreviewUrls);

        const newScripts = [...scripts];
        newScripts[i] = videoData.script;
        setScripts(newScripts);

        setSelectedQuestionIndex(i);
      }

      setCurrentProcessingIndex(null);
      toast({
        title: "Success",
        description: `Created ${questions.length} Would You Rather videos!`,
      });

    } catch (error) {
      console.error("Error creating would you rather videos:", error);
      toast({
        title: "Error",
        description: "Failed to create videos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setCurrentProcessingIndex(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <QuestionGenerationForm onQuestionsGenerated={handleQuestionsGenerated} />
          
          <QuestionForm
            questions={questions}
            selectedQuestionIndex={selectedQuestionIndex}
            setQuestions={setQuestions}
            selectedVoice={selectedVoice}
            setSelectedVoice={setSelectedVoice}
            currentProcessingIndex={currentProcessingIndex}
          />

          <Button type="submit" disabled={isSubmitting || userLoading}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Videos...
              </>
            ) : (
              "Create Videos"
            )}
          </Button>
        </form>
      </Card>

      <VideoPreviewSection
        previewUrls={previewUrls}
        scripts={scripts}
        selectedQuestionIndex={selectedQuestionIndex}
        selectedVoice={selectedVoice}
      />
    </div>
  );
};