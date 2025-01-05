import { ArrowBigUp, MessageSquare } from "lucide-react";

interface RedditCommentProps {
  content: string;
  votes?: number;
  replies?: number;
  darkMode?: boolean;
}

export const RedditComment = ({ 
  content, 
  votes = Math.floor(Math.random() * 1000), 
  replies = Math.floor(Math.random() * 100),
  darkMode = false 
}: RedditCommentProps) => {
  return (
    <div className={`rounded-lg p-4 ${darkMode ? 'bg-[#272729] text-white' : 'bg-white'} shadow-sm border border-gray-700`}>
      <div className="flex items-start gap-2">
        <div className={`flex flex-col items-center ${darkMode ? 'text-gray-400' : 'text-muted-foreground'}`}>
          <ArrowBigUp className="w-5 h-5" />
          <span className="text-sm font-medium">{votes}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-6 w-6 rounded-full bg-accent" />
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-muted-foreground'}`}>Anonymous</span>
            <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-muted-foreground'}`}>• 2h ago</span>
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-foreground'}`}>{content}</p>
          <div className={`flex items-center gap-2 mt-2 ${darkMode ? 'text-gray-400' : 'text-muted-foreground'}`}>
            <MessageSquare className="w-4 h-4" />
            <span className="text-xs">{replies} replies</span>
          </div>
        </div>
      </div>
    </div>
  );
};