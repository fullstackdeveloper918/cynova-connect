import { QuizQuestion } from "./QuizVideoEditor";

interface QuestionDisplayProps {
  question: QuizQuestion;
  showAnswers: boolean;
}

export const QuestionDisplay = ({ question, showAnswers }: QuestionDisplayProps) => {
  if (!question) return null;

  return (
    <div className="text-center space-y-4">
      <h3 className="text-xl font-bold">{question.question}</h3>
      
      {showAnswers && (
        question.type === "multiple_choice" ? (
          <div className="grid grid-cols-2 gap-3">
            {question.options?.map((option, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg cursor-pointer transition-colors text-sm ${
                  option === question.correctAnswer
                    ? "bg-green-500/50"
                    : "bg-white/10"
                }`}
              >
                {option}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center gap-4">
            {["True", "False"].map((option) => (
              <div
                key={option}
                className={`px-6 py-3 rounded-lg cursor-pointer transition-colors ${
                  option === question.correctAnswer
                    ? "bg-green-500/50"
                    : "bg-white/10"
                }`}
              >
                {option}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};