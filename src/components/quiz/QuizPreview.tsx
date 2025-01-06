import { useRef, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import type { QuizQuestion } from "./QuizVideoEditor";
import { supabase } from "@/integrations/supabase/client";
import { QuestionDisplay } from "./QuestionDisplay";
import { GameplayVideo } from "./GameplayVideo";

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
  const [showAnswers, setShowAnswers] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  // Reset states when playing state changes
  useEffect(() => {
    if (!isPlaying) {
      setShowAnswers(false);
      setPreviewAudioUrl(null);
      return;
    }

    const playQuestion = async () => {
      setShowAnswers(false);
      setIsAudioLoading(true);
      await generateAudioNarration();
    };

    playQuestion();
  }, [currentQuestionIndex, isPlaying]);

  const generateAudioNarration = async () => {
    if (!currentQuestion) return;
    
    const questionText = `${currentQuestion.question}. ${
      currentQuestion.type === "multiple_choice" 
        ? `Options are: ${currentQuestion.options?.join(", ")}`
        : "True or False?"
    }`;

    try {
      console.log("Generating audio for question:", questionText);
      const { data, error } = await supabase.functions.invoke("generate-video-preview", {
        body: { 
          script: questionText,
          voice: "EXAVITQu4vr4xnSDxMaL", // Sarah's voice
          duration: "30"
        }
      });

      if (error) throw error;
      
      if (data.previewUrl?.audioUrl) {
        console.log("Audio URL received:", data.previewUrl.audioUrl);
        setPreviewAudioUrl(data.previewUrl.audioUrl);
      }
    } catch (error) {
      console.error("Error generating audio narration:", error);
      setIsPlaying(false);
    } finally {
      setIsAudioLoading(false);
    }
  };

  const handleQuestionChange = (direction: 'next' | 'prev') => {
    setShowAnswers(false);
    setPreviewAudioUrl(null);
    setIsPlaying(false);
    if (direction === 'next') {
      setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1));
    } else {
      setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1));
    }
  };

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleAudioEnd = () => {
    console.log("Audio ended, showing answers");
    setShowAnswers(true);
    // Wait for 3 seconds after showing answers before moving to next question
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        handleQuestionChange('next');
        setIsPlaying(true); // Keep playing for next question
      } else {
        setIsPlaying(false); // Stop at the end
      }
    }, 3000);
  };

  return (
    <Card className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Preview</h2>

      <div className="aspect-[9/16] w-full max-w-[350px] mx-auto bg-black rounded-lg overflow-hidden relative">
        {previewUrl ? (
          <video
            ref={videoRef}
            src={previewUrl}
            controls
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col cursor-pointer" onClick={handlePlay}>
            {/* Top half - Question display */}
            <div className="flex-1 bg-gradient-to-b from-purple-900 to-purple-800 p-6 flex items-center justify-center text-white">
              {currentQuestion && (
                <QuestionDisplay 
                  question={currentQuestion} 
                  showAnswers={showAnswers}
                  isLoading={isAudioLoading}
                />
              )}
            </div>

            {/* Bottom half - Gameplay */}
            <GameplayVideo url={gameplayUrl} />

            {/* Play/Pause indicator */}
            <div className="absolute bottom-4 left-4 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
              {isPlaying ? 'Click to pause' : 'Click to play'}
            </div>
          </div>
        )}

        {/* Audio element */}
        {previewAudioUrl && (
          <audio
            key={previewAudioUrl} // Force new audio element on URL change
            src={previewAudioUrl}
            autoPlay
            className="hidden"
            onEnded={handleAudioEnd}
          />
        )}
      </div>

      <div className="flex justify-between items-center">
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => handleQuestionChange('prev')}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => handleQuestionChange('next')}
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