import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export const ChatGPTVideoEditor = () => {
  const [prompt, setPrompt] = useState("");

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Video Prompt</label>
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your video idea..."
            className="mt-1"
          />
        </div>
        <Button disabled={!prompt}>
          Generate Video
        </Button>
      </div>
    </Card>
  );
};