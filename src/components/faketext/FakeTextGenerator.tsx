import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ConversationPreview } from './ConversationPreview';
import { PreviewControls } from './PreviewControls';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const FakeTextGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState([]);

  const handleGenerate = async () => {
    if (!prompt || !topic) {
      toast({
        title: "Missing information",
        description: "Please provide both a prompt and a topic.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      console.log('Starting generation with:', { prompt, topic, duration });
      
      // Log the current environment
      console.log('Current URL:', window.location.href);
      console.log('Supabase URL:', supabase.supabaseUrl);
      
      const { data, error } = await supabase.functions.invoke('generate-fake-text', {
        body: { prompt, topic, duration, voiceId: "EXAVITQu4vr4xnSDxMaL" }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Generation response:', data);
      
      if (data?.messages) {
        setMessages(data.messages);
        toast({
          title: "Success",
          description: "Conversation generated successfully!",
        });
      } else {
        throw new Error('No messages in response');
      }
    } catch (error) {
      console.error('Detailed error:', {
        error,
        stack: error.stack,
        message: error.message,
        name: error.name
      });
      
      toast({
        title: "Generation failed",
        description: "There was an error generating your conversation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              placeholder="Enter a topic for the conversation"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="Describe the conversation you want to create..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <div>
            <Label htmlFor="duration">Duration (seconds)</Label>
            <Input
              id="duration"
              type="number"
              min={10}
              max={300}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? "Generating..." : "Generate Conversation"}
          </Button>
        </div>
      </Card>

      {messages.length > 0 && (
        <>
          <ConversationPreview messages={messages} />
          <PreviewControls messages={messages} />
        </>
      )}
    </div>
  );
};