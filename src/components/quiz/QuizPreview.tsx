import { useRef, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import type { QuizQuestion } from "./QuizVideoEditor";
import { supabase } from "@/integrations/supabase/client";

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
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswers, setShowAnswers] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown > 0) {
      // Play tick sound
      if (audioRef.current) {
        audioRef.current.play();
      }
      
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShowAnswers(true);
      
      // After showing answers, wait 3 seconds and move to next question
      const nextQuestionTimer = setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          handleQuestionChange('next');
        }
      }, 3000);
      
      return () => clearTimeout(nextQuestionTimer);
    }
  }, [countdown, currentQuestionIndex, questions.length]);

  const generateAudioNarration = async () => {
    if (!currentQuestion) return;
    
    const questionText = `${currentQuestion.question}. ${
      currentQuestion.type === "multiple_choice" 
        ? `Options are: ${currentQuestion.options?.join(", ")}`
        : "True or False?"
    }`;

    try {
      const { data, error } = await supabase.functions.invoke("generate-video-preview", {
        body: { 
          script: questionText,
          voice: "EXAVITQu4vr4xnSDxMaL", // Sarah's voice
          duration: "30"
        }
      });

      if (error) throw error;
      
      if (data.previewUrl?.audioUrl) {
        setPreviewAudioUrl(data.previewUrl.audioUrl);
      }
    } catch (error) {
      console.error("Error generating audio narration:", error);
    }
  };

  const handleQuestionChange = (direction: 'next' | 'prev') => {
    setShowAnswers(false);
    setCountdown(null);
    setIsPlaying(false);
    if (direction === 'next') {
      setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1));
    } else {
      setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1));
    }
  };

  const handlePlay = async () => {
    if (!isPlaying) {
      setIsPlaying(true);
      await generateAudioNarration();
      setCountdown(3);
    } else {
      setIsPlaying(false);
      setCountdown(null);
      setShowAnswers(false);
    }
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
              <div className="text-center space-y-4">
                <h3 className="text-xl font-bold">{currentQuestion?.question}</h3>
                
                {/* Countdown display */}
                {countdown !== null && !showAnswers && (
                  <div className="text-4xl font-bold animate-pulse">
                    {countdown}
                  </div>
                )}
                
                {/* Options display */}
                {showAnswers && (
                  currentQuestion?.type === "multiple_choice" ? (
                    <div className="grid grid-cols-2 gap-3">
                      {currentQuestion.options?.map((option, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg cursor-pointer transition-colors text-sm ${
                            option === currentQuestion.correctAnswer
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
                            option === currentQuestion.correctAnswer
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

            {/* Play/Pause indicator */}
            <div className="absolute bottom-4 left-4 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
              {isPlaying ? 'Click to pause' : 'Click to play'}
            </div>
          </div>
        )}

        {/* Audio elements */}
        <audio 
          ref={audioRef} 
          src="/tick.mp3" 
          className="hidden"
        />
        {previewAudioUrl && (
          <audio
            src={previewAudioUrl}
            autoPlay
            className="hidden"
            onEnded={() => {
              if (isPlaying) {
                setCountdown(3);
              }
            }}
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