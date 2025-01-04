import { motion } from "framer-motion";
import { Download, FileVideo } from "lucide-react";
import { Button } from "./ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "./ui/use-toast";

interface Export {
  id: string;
  title: string;
  thumbnail_url: string;
  file_url: string;
  created_at: string;
  file_size: number;
  file_type: string;
  description: string;
}

export const ExportsGrid = () => {
  const { data: exports, isLoading, error } = useQuery({
    queryKey: ['exports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Export[];
    },
  });

  const handleDownload = async (exportItem: Export) => {
    try {
      // Get the public URL for the file
      const { data: publicURL } = supabase.storage
        .from('exports')
        .getPublicUrl(exportItem.file_url);

      if (!publicURL?.publicUrl) {
        throw new Error('Could not generate download URL');
      }

      // Create a temporary anchor element to trigger the download
      const link = document.createElement('a');
      link.href = publicURL.publicUrl;
      link.download = exportItem.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download started",
        description: "Your file will be downloaded shortly.",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "There was an error downloading your file. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading exports...</div>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-destructive">
        Error loading exports: {error.message}
      </div>
    );
  }

  if (!exports?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <FileVideo className="w-12 h-12 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No exports yet</h3>
        <p>Your exported videos will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">My Exports</h2>
          <p className="text-muted-foreground mt-1">
            Access and download your exported videos
          </p>
        </div>
        <span className="text-muted-foreground bg-accent/50 px-3 py-1 rounded-full">
          {exports.length} exports
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exports.map((exportItem, index) => (
          <motion.div
            key={exportItem.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative overflow-hidden rounded-lg border border-accent bg-card hover:shadow-lg transition-all duration-300"
          >
            <div className="aspect-video w-full overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
              <img
                src={exportItem.thumbnail_url || '/placeholder.svg'}
                alt={exportItem.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute top-2 right-2 z-20 bg-accent/90 text-accent-foreground px-2 py-1 rounded-full text-xs font-medium">
                {exportItem.file_type}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{exportItem.title}</h3>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground flex items-center">
                  <FileVideo className="w-4 h-4 mr-1" />
                  {Math.round(exportItem.file_size / 1024 / 1024)}MB
                </span>
                <span className="text-sm text-muted-foreground">
                  {new Date(exportItem.created_at).toLocaleDateString()}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                onClick={() => handleDownload(exportItem)}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};