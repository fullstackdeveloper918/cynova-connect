import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Users, FolderOpen, FileVideo } from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  activeProjects: number;
  totalExports: number;
}

export const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin", "dashboard-stats"],
    queryFn: async () => {
      const [usersCount, projectsCount, exportsCount] = await Promise.all([
        supabase.from("user_roles").select("id", { count: "exact" }),
        supabase.from("projects").select("id", { count: "exact" }),
        supabase.from("exports").select("id", { count: "exact" }),
      ]);

      return {
        totalUsers: usersCount.count || 0,
        activeProjects: projectsCount.count || 0,
        totalExports: exportsCount.count || 0,
      };
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Users</p>
              {isLoading ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                <p className="text-2xl font-bold">{stats?.totalUsers}</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <FolderOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
              {isLoading ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                <p className="text-2xl font-bold">{stats?.activeProjects}</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <FileVideo className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Exports</p>
              {isLoading ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                <p className="text-2xl font-bold">{stats?.totalExports}</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <Activity className="h-5 w-5 text-muted-foreground" />
        </div>
        <RecentActivity />
      </Card>
    </div>
  );
};

const RecentActivity = () => {
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
          <span className="text-sm text-muted-foreground">{activity.entity_type}</span>
        </div>
      ))}
    </div>
  );
};