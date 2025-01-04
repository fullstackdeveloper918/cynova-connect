export interface Message {
  content: string;
  isUser: boolean;
  timestamp: string;
  audioUrl?: string;
}