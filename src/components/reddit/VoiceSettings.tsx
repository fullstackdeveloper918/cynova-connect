import { Card, CardContent } from "@/components/ui/card";
import { VoiceSelector } from "@/components/chatgpt/VoiceSelector";

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
      <CardContent className="pt-6 space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Title Voice
          </label>
          <VoiceSelector
            value={titleVoice}
            onChange={onTitleVoiceSelect}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">
            Comments Voice
          </label>
          <VoiceSelector
            value={commentVoice}
            onChange={onCommentVoiceSelect}
          />
        </div>
      </CardContent>
    </Card>
  );
};