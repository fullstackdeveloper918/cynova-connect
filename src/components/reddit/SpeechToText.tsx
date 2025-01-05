import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface SpeechToTextProps {
  onTranscript: (text: string) => void;
}

export const SpeechToText = ({ onTranscript }: SpeechToTextProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join(" ");
        onTranscript(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
        toast({
          title: "Speech Recognition Error",
          description: "There was an error with speech recognition. Please try again.",
          variant: "destructive",
        });
      };

      setRecognition(recognition);
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [onTranscript]);

  const toggleRecording = () => {
    if (!recognition) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      });
      return;
    }

    if (isRecording) {
      recognition.stop();
    } else {
      recognition.start();
    }
    setIsRecording(!isRecording);
  };

  return (
    <Button
      onClick={toggleRecording}
      variant={isRecording ? "destructive" : "secondary"}
      className="gap-2"
    >
      {isRecording ? (
        <>
          <MicOff className="h-4 w-4" />
          Stop Recording
        </>
      ) : (
        <>
          <Mic className="h-4 w-4" />
          Start Recording
        </>
      )}
    </Button>
  );
};