import { useState } from "react";
import { Card } from "@/components/ui/card";
import { QuizCreationForm } from "./QuizCreationForm";
import { QuizPreview } from "./QuizPreview";
import { GameplaySelector } from "../split/GameplaySelector";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const QuizVideoEditor = () => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selectedGameplay, setSelectedGameplay] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const { toast } = useToast();

  const handleQuestionsGenerated = async (newQuestions: QuizQuestion[]) => {
    setQuestions(newQuestions);
    
    try {
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          title: "Quiz Video",
          type: "quiz",
          user_id: (await supabase.auth.getUser()).data.user?.id,
          status: 'draft'
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Save questions to database
      const { error: questionsError } = await supabase
        .from('quiz_questions')
        .insert(
          newQuestions.map(q => ({
            project_id: project.id,
            user_id: (await supabase.auth.getUser()).data.user?.id,
            question: q.question,
            question_type: q.type,
            options: q.options,
            correct_answer: q.correctAnswer
          }))
        );

      if (questionsError) throw questionsError;

      toast({
        title: "Questions saved",
        description: "Your quiz questions have been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving questions:', error);
      toast({
        title: "Error saving questions",
        description: "There was an error saving your quiz questions.",
        variant: "destructive",
      });
    }
  };

  const handleGameplaySelect = (url: string) => {
    setSelectedGameplay(url);
  };

  const handleExport = async () => {
    if (!questions.length) {
      toast({
        title: "No questions",
        description: "Please create or generate some questions first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-quiz-video", {
        body: {
          questions,
          gameplayUrl: selectedGameplay,
        },
      });

      if (error) throw error;

      setPreviewUrl(data.videoUrl);
      toast({
        title: "Video generated",
        description: "Your quiz video has been generated successfully.",
      });
    } catch (error) {
      console.error('Error generating video:', error);
      toast({
        title: "Generation failed",
        description: "There was an error generating your video.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 p-6">
      <QuizCreationForm onQuestionsGenerated={handleQuestionsGenerated} />
      
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Background Gameplay</h2>
        <GameplaySelector onSelect={handleGameplaySelect} selectedUrl={selectedGameplay} />
      </Card>

      {questions.length > 0 && (
        <QuizPreview
          questions={questions}
          gameplayUrl={selectedGameplay}
          previewUrl={previewUrl}
          isGenerating={isGenerating}
          onExport={handleExport}
        />
      )}
    </div>
  );
};

export interface QuizQuestion {
  question: string;
  type: 'multiple_choice' | 'true_false';
  options?: string[];
  correctAnswer: string;
}