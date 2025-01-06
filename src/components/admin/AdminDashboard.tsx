import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  Users,
  FolderOpen,
  FileVideo,
  TrendingUp,
  Settings,
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

interface DashboardStats {
  totalUsers: number;
  activeProjects: number;
  totalExports: number;
  dailyActiveUsers: number;
  storageUsed: number;
  pendingExports: number;
}

export const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin", "dashboard-stats"],
    queryFn: async () => {
      const [
        usersCount,
        projectsCount,
        exportsCount,
        pendingExportsCount,
      ] = await Promise.all([
        supabase.from("user_roles").select("id", { count: "exact" }),
        supabase.from("projects").select("id", { count: "exact" }),
        supabase.from("exports").select("id", { count: "exact" }),
        supabase
          .from("exports")
          .select("id", { count: "exact" })
          .eq("status", "pending"),
      ]);

      return {
        totalUsers: usersCount.count || 0,
        activeProjects: projectsCount.count || 0,
        totalExports: exportsCount.count || 0,
        dailyActiveUsers: Math.floor(Math.random() * 100), // Placeholder for demo
        storageUsed: Math.floor(Math.random() * 1000), // Placeholder for demo
        pendingExports: pendingExportsCount.count || 0,
      };
    },
  });

  const { data: activityData } = useQuery({
    queryKey: ["admin", "activity-chart"],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data } = await supabase
        .from("exports")
        .select("created_at")
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: true });

      const activityByDay = data?.reduce((acc: any, curr) => {
        const date = new Date(curr.created_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(activityByDay || {}).map(([date, count]) => ({
        date,
        exports: count,
      }));
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Settings className="h-6 w-6 text-muted-foreground" />
      </div>

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
          title="Storage Used (GB)"
          value={stats?.storageUsed}
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
            <LineChart data={activityData || []}>
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
        <div className="space-y-4">
          <HealthIndicator
            name="API Status"
            status="healthy"
            latency="45ms"
          />
          <HealthIndicator
            name="Database"
            status="healthy"
            latency="12ms"
          />
          <HealthIndicator
            name="Storage"
            status="warning"
            latency="89ms"
          />
        </div>
      </Card>
    </div>
  );
};

const StatsCard = ({
  icon,
  title,
  value,
  isLoading,
}: {
  icon: React.ReactNode;
  title: string;
  value?: number;
  isLoading?: boolean;
}) => (
  <Card className="p-6">
    <div className="flex items-center gap-4">
      <div className="rounded-lg bg-primary/10 p-3">{icon}</div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {isLoading ? (
          <Skeleton className="h-7 w-20" />
        ) : (
          <p className="text-2xl font-bold">{value?.toLocaleString()}</p>
        )}
      </div>
    </div>
  </Card>
);

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
          <span className="text-sm text-muted-foreground">
            {activity.entity_type}
          </span>
        </div>
      ))}
    </div>
  );
};

const HealthIndicator = ({
  name,
  status,
  latency,
}: {
  name: string;
  status: "healthy" | "warning" | "error";
  latency: string;
}) => {
  const statusColors = {
    healthy: "text-green-500",
    warning: "text-yellow-500",
    error: "text-red-500",
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${statusColors[status]}`} />
        <span className="font-medium">{name}</span>
      </div>
      <span className="text-sm text-muted-foreground">{latency}</span>
    </div>
  );
};