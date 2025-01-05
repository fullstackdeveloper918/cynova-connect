import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VoiceSelector } from "../chatgpt/VoiceSelector";

interface VoiceSettingsProps {
  titleVoice: string;
  commentVoice: string;
  onTitleVoiceSelect: (voice: string) => void;
  onCommentVoiceSelect: (voice: string) => void;
}

export const VoiceSettings = ({
  titleVoice,
  commentVoice,
  onTitleVoiceSelect,
  onCommentVoiceSelect,
}: VoiceSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Voice Settings</CardTitle>
        <CardDescription>
          Choose different voices for the title and comments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Title Voice</label>
          <VoiceSelector
            selectedVoice={titleVoice}
            onVoiceSelect={onTitleVoiceSelect}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Comment Voice</label>
          <VoiceSelector
            selectedVoice={commentVoice}
            onVoiceSelect={onCommentVoiceSelect}
          />
        </div>
      </CardContent>
    </Card>
  );
};