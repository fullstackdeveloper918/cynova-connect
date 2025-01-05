export interface Message {
  content: string;
  isUser: boolean;
  timestamp: string;
}

export interface ConversationRequest {
  prompt: string;
  topic: string;
  duration: number;
  voiceId: string;
}

export interface AudioResponse {
  audioUrl: string;
}

export interface MessageWithAudio extends Message {
  audioUrl: string | null;
}