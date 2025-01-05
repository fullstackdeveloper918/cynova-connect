import { Card, CardContent } from "../ui/card";
import { Scissors } from "lucide-react";

interface VideoSegment {
  start: number;
  end: number;
  name: string;
  status?: string;
  file_url?: string;
}

interface VideoSegmentsProps {
  segments: VideoSegment[];
}

export const VideoSegments = ({ segments }: VideoSegmentsProps) => {
  if (segments.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Scissors className="h-5 w-5" />
        Segments ({segments.length})
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {segments.map((segment, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="font-medium">{segment.name}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {segment.start.toFixed(2)}s - {segment.end.toFixed(2)}s
              </div>
              {segment.status && (
                <div className="text-sm mt-2">
                  Status: {segment.status}
                </div>
              )}
              {segment.file_url && (
                <div className="mt-2">
                  <a
                    href={segment.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline"
                  >
                    Download Segment
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};