import { ArrowBigUp, MessageSquare } from "lucide-react";

interface RedditPostProps {
  title: string;
  votes?: number;
  comments?: number;
}

export const RedditPost = ({ title, votes = Math.floor(Math.random() * 10000), comments = Math.floor(Math.random() * 1000) }: RedditPostProps) => {
  return (
    <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
      <div className="flex gap-2">
        <div className="flex flex-col items-center text-muted-foreground">
          <ArrowBigUp className="w-5 h-5" />
          <span className="text-sm font-medium">{votes}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-6 rounded-full bg-accent" />
            <span className="text-sm font-medium text-muted-foreground">Anonymous</span>
            <span className="text-xs text-muted-foreground">• 4h ago</span>
          </div>
          <h2 className="text-lg font-semibold mb-2">{title}</h2>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm">{comments} comments</span>
          </div>
        </div>
      </div>
    </div>
  );
};