import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import type { QuizQuestion } from "./QuizVideoEditor";

interface QuizPreviewProps {
  questions: QuizQuestion[];
  gameplayUrl: string;
  previewUrl: string;
  isGenerating: boolean;
  onExport: () => void;
}

export const QuizPreview = ({
  questions,
  gameplayUrl,
  previewUrl,
  isGenerating,
  onExport,
}: QuizPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Card className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Preview</h2>

      <div className="aspect-[9/16] bg-black rounded-lg overflow-hidden relative">
        {previewUrl ? (
          <video
            ref={videoRef}
            src={previewUrl}
            controls
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col">
            {/* Top half - Question display */}
            <div className="flex-1 bg-gradient-to-b from-purple-900 to-purple-800 p-6 flex items-center justify-center text-white">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold">{currentQuestion.question}</h3>
                {currentQuestion.type === "multiple_choice" ? (
                  <div className="grid grid-cols-2 gap-4">
                    {currentQuestion.options?.map((option, index) => (
                      <div
                        key={index}
                        className="bg-white/10 p-4 rounded-lg cursor-pointer hover:bg-white/20 transition-colors"
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex justify-center gap-4">
                    <div className="bg-white/10 px-8 py-4 rounded-lg cursor-pointer hover:bg-white/20 transition-colors">
                      True
                    </div>
                    <div className="bg-white/10 px-8 py-4 rounded-lg cursor-pointer hover:bg-white/20 transition-colors">
                      False
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom half - Gameplay */}
            {gameplayUrl && (
              <div className="flex-1 bg-black">
                <video
                  src={gameplayUrl}
                  autoPlay
                  muted
                  loop
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
            disabled={currentQuestionIndex === questions.length - 1}
          >
            Next
          </Button>
        </div>

        <Button onClick={onExport} disabled={isGenerating}>
          <Save className="mr-2 h-4 w-4" />
          {isGenerating ? "Generating..." : "Generate Video"}
        </Button>
      </div>
    </Card>
  );
};