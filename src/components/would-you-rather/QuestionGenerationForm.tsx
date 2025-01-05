import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Wand2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QuestionGenerationFormProps {
  onQuestionsGenerated: (questions: Array<{ optionA: string; optionB: string }>) => void;
}

export const QuestionGenerationForm = ({ onQuestionsGenerated }: QuestionGenerationFormProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [questionCount, setQuestionCount] = useState(1);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "generate-would-you-rather-questions",
        { 
          body: { 
            count: Math.min(Math.max(1, questionCount), 10) 
          } 
        }
      );

      if (error) throw error;

      onQuestionsGenerated(data.questions);

      toast({
        title: "Questions Generated",
        description: "Feel free to edit them or use them as is!",
      });
    } catch (error) {
      console.error('Error generating questions:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex gap-4 mb-4">
      <Input
        type="number"
        min={1}
        max={10}
        value={questionCount}
        onChange={(e) => setQuestionCount(Math.min(Math.max(1, parseInt(e.target.value) || 1), 10))}
        className="w-24"
        placeholder="Count"
      />
      <Button
        type="button"
        variant="secondary"
        onClick={handleGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Wand2 className="mr-2 h-4 w-4" />
            Generate Questions
          </>
        )}
      </Button>
    </div>
  );
};