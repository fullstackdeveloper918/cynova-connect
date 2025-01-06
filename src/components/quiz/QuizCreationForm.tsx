import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wand2, Plus, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { QuizQuestion } from "./QuizVideoEditor";

interface QuizCreationFormProps {
  onQuestionsGenerated: (questions: QuizQuestion[]) => void;
}

export const QuizCreationForm = ({ onQuestionsGenerated }: QuizCreationFormProps) => {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [manualQuestions, setManualQuestions] = useState<QuizQuestion[]>([]);
  const { toast } = useToast();

  const handleGenerateQuestions = async () => {
    if (!topic) {
      toast({
        title: "Topic required",
        description: "Please enter a topic for your quiz.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-quiz-questions", {
        body: { topic },
      });

      if (error) throw error;

      onQuestionsGenerated(data.questions);
      toast({
        title: "Questions generated",
        description: "Your quiz questions have been generated successfully.",
      });
    } catch (error) {
      console.error('Error generating questions:', error);
      toast({
        title: "Generation failed",
        description: "There was an error generating your questions.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const addManualQuestion = () => {
    setManualQuestions([
      ...manualQuestions,
      {
        question: "",
        type: "multiple_choice",
        options: ["", "", "", ""],
        correctAnswer: "",
      },
    ]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updatedQuestions = [...manualQuestions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };
    setManualQuestions(updatedQuestions);
  };

  const removeQuestion = (index: number) => {
    setManualQuestions(manualQuestions.filter((_, i) => i !== index));
  };

  const handleSaveManual = () => {
    if (!manualQuestions.length) {
      toast({
        title: "No questions",
        description: "Please add at least one question.",
        variant: "destructive",
      });
      return;
    }

    const isValid = manualQuestions.every(q => 
      q.question && q.correctAnswer && 
      (q.type === 'true_false' || (q.options && q.options.every(o => o)))
    );

    if (!isValid) {
      toast({
        title: "Invalid questions",
        description: "Please fill in all required fields for each question.",
        variant: "destructive",
      });
      return;
    }

    onQuestionsGenerated(manualQuestions);
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Create Quiz Questions</h2>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Generate with AI</h3>
          <div className="flex gap-4">
            <Input
              placeholder="Enter a topic for your quiz..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleGenerateQuestions}
              disabled={isGenerating || !topic}
            >
              <Wand2 className="mr-2 h-4 w-4" />
              Generate
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Manual Creation</h3>
            <Button onClick={addManualQuestion} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </div>

          {manualQuestions.map((question, index) => (
            <div key={index} className="space-y-4 p-4 border rounded-lg">
              <div className="flex justify-between">
                <h4 className="font-medium">Question {index + 1}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeQuestion(index)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>

              <Textarea
                placeholder="Enter your question..."
                value={question.question}
                onChange={(e) => updateQuestion(index, "question", e.target.value)}
              />

              <Select
                value={question.type}
                onValueChange={(value) => updateQuestion(index, "type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select question type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="true_false">True/False</SelectItem>
                </SelectContent>
              </Select>

              {question.type === "multiple_choice" && (
                <div className="space-y-2">
                  {question.options?.map((option, optionIndex) => (
                    <Input
                      key={optionIndex}
                      placeholder={`Option ${optionIndex + 1}`}
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...(question.options || [])];
                        newOptions[optionIndex] = e.target.value;
                        updateQuestion(index, "options", newOptions);
                      }}
                    />
                  ))}
                </div>
              )}

              <Input
                placeholder="Correct answer..."
                value={question.correctAnswer}
                onChange={(e) => updateQuestion(index, "correctAnswer", e.target.value)}
              />
            </div>
          ))}

          {manualQuestions.length > 0 && (
            <Button onClick={handleSaveManual} className="w-full">
              Save Questions
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};