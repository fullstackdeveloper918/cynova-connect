import { Video } from "lucide-react";

export const EmptyState = () => {
  return (
    <div className="text-center space-y-2 text-muted-foreground h-full flex items-center justify-center">
      <Video className="mx-auto h-12 w-12 animate-pulse" />
      <p>Click preview to generate your video</p>
    </div>
  );
};