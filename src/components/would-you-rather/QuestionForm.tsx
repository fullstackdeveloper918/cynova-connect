import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface QuestionFormProps {
  questions: Array<{ optionA: string; optionB: string }>;
  selectedQuestionIndex: number;
  setQuestions: (questions: Array<{ optionA: string; optionB: string }>) => void;
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
  currentProcessingIndex: number | null;
}

export const QuestionForm = ({
  questions,
  selectedQuestionIndex,
  setQuestions,
  selectedVoice,
  setSelectedVoice,
  currentProcessingIndex,
}: QuestionFormProps) => {
  return (
    <div className="space-y-4">
      {questions.length > 1 && (
        <Select 
          value={selectedQuestionIndex.toString()} 
          onValueChange={(value) => {
            console.log('Selecting question:', parseInt(value));
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a question" />
          </SelectTrigger>
          <SelectContent>
            {questions.map((_, index) => (
              <SelectItem key={index} value={index.toString()}>
                Question {index + 1} {currentProcessingIndex === index && "- Processing..."}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">
          Would you rather...
        </label>
        <Input
          placeholder="Option A"
          value={questions[selectedQuestionIndex]?.optionA || ""}
          onChange={(e) => {
            const newQuestions = [...questions];
            newQuestions[selectedQuestionIndex] = {
              ...newQuestions[selectedQuestionIndex],
              optionA: e.target.value
            };
            setQuestions(newQuestions);
          }}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">OR</label>
        <Input
          placeholder="Option B"
          value={questions[selectedQuestionIndex]?.optionB || ""}
          onChange={(e) => {
            const newQuestions = [...questions];
            newQuestions[selectedQuestionIndex] = {
              ...newQuestions[selectedQuestionIndex],
              optionB: e.target.value
            };
            setQuestions(newQuestions);
          }}
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
  );
};