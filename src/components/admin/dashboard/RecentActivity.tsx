import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export const RecentActivity = () => {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["admin", "recent-activities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!activities?.length) {
    return <p className="text-muted-foreground">No recent activity</p>;
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center justify-between">
          <div>
            <p className="font-medium">{activity.action}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(activity.created_at!).toLocaleString()}
            </p>
          </div>
          <span className="text-sm text-muted-foreground">
            {activity.entity_type}
          </span>
        </div>
      ))}
    </div>
  );
};