import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const useVideoExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportVideo = async ({
    script,
    frames,
  }: {
    script: string;
    frames: string[];
  }) => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke("export-video", {
        body: { script, frames }
      });

      if (error) throw error;

      if (data?.exportUrl) {
        toast({
          title: "Success",
          description: "Video exported successfully",
        });
      }
    } catch (error) {
      console.error('Error exporting video:', error);
      toast({
        title: "Error",
        description: "Failed to export video",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportVideo,
    isExporting,
  };
};