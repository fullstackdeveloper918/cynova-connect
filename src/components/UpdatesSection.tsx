import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const UpdatesSection = () => {
  const { data: updates, isLoading, error } = useQuery({
    queryKey: ["cynova-updates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cynova_updates")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
  });

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load updates. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return <div>Loading updates...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-accent rounded-lg p-6 mb-8"
    >
      <h2 className="text-2xl font-bold text-primary mb-4">Cynova Updates</h2>
      <div className="space-y-4">
        {updates?.map((update) => (
          <div
            key={update.id}
            className="flex items-center justify-between border-b border-accent pb-2 last:border-0"
          >
            <p className="text-muted-foreground">{update.title}</p>
            <span className="text-sm text-muted-foreground">
              {new Date(update.created_at).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};