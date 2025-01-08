import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import {
  Activity,
  Users,
  FolderOpen,
  FileVideo,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { StatsCard } from "./StatsCard";
import { SystemHealth } from "./SystemHealth";
import { RecentActivity } from "./RecentActivity";

interface DashboardStats {
  totalUsers: number;
  activeProjects: number;
  totalExports: number;
  dailyActiveUsers: number;
  storageUsed: number;
  pendingExports: number;
}

const bytesToGB = (bytes: number) => {
  return (bytes / (1024 * 1024 * 1024)).toFixed(2);
};

export const DashboardOverview = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin", "dashboard-stats"],
    queryFn: async () => {
      const [
        usersCount,
        projectsCount,
        exportsCount,
        pendingExportsCount,
        { data: storageData, error: storageError },
      ] = await Promise.all([
        supabase.from("user_roles").select("id", { count: "exact" }),
        supabase.from("projects").select("id", { count: "exact" }),
        supabase.from("exports").select("id", { count: "exact" }),
        supabase
          .from("exports")
          .select("id", { count: "exact" })
          .eq("status", "pending"),
        supabase.rpc('calculate_total_storage'),
      ]);

      if (storageError) {
        console.error('Error calculating storage:', storageError);
      }

      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      const { count: activeUsers } = await supabase
        .from("exports")
        .select("user_id", { count: "exact", head: true })
        .gte("created_at", oneDayAgo.toISOString())
        .not("user_id", "is", null);

      return {
        totalUsers: usersCount.count || 0,
        activeProjects: projectsCount.count || 0,
        totalExports: exportsCount.count || 0,
        dailyActiveUsers: activeUsers || 0,
        storageUsed: storageData || 0,
        pendingExports: pendingExportsCount.count || 0,
      };
    },
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          icon={<Users className="h-6 w-6 text-primary" />}
          title="Total Users"
          value={stats?.totalUsers}
          isLoading={isLoading}
        />
        <StatsCard
          icon={<FolderOpen className="h-6 w-6 text-primary" />}
          title="Active Projects"
          value={stats?.activeProjects}
          isLoading={isLoading}
        />
        <StatsCard
          icon={<FileVideo className="h-6 w-6 text-primary" />}
          title="Total Exports"
          value={stats?.totalExports}
          isLoading={isLoading}
        />
        <StatsCard
          icon={<TrendingUp className="h-6 w-6 text-primary" />}
          title="Daily Active Users"
          value={stats?.dailyActiveUsers}
          isLoading={isLoading}
        />
        <StatsCard
          icon={<Activity className="h-6 w-6 text-primary" />}
          title="Storage Used"
          value={stats?.storageUsed ? bytesToGB(stats.storageUsed) : 0}
          unit="GB"
          isLoading={isLoading}
        />
        <StatsCard
          icon={<AlertCircle className="h-6 w-6 text-primary" />}
          title="Pending Exports"
          value={stats?.pendingExports}
          isLoading={isLoading}
        />
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Export Activity (30 Days)</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="exports"
                stroke="#8884d8"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </div>
          <RecentActivity />
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">System Health</h2>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </div>
          <SystemHealth />
        </Card>
      </div>
    </div>
  );
};