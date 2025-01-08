import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Database, Server, HardDrive, Activity } from "lucide-react";
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

export const SystemHealthDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin", "system-health"],
    queryFn: async () => {
      const [{ data: storageData }, { count: totalProjects }, { count: activeUsers }] = await Promise.all([
        supabase.rpc('calculate_total_storage'),
        supabase.from("projects").select("*", { count: "exact" }),
        supabase.from("user_roles").select("*", { count: "exact" }),
      ]);

      return {
        storageUsed: storageData || 0,
        databaseSize: storageData ? (storageData / (1024 * 1024 * 1024)).toFixed(2) : 0,
        totalProjects: totalProjects || 0,
        activeUsers: activeUsers || 0,
      };
    },
  });

  const bytesToGB = (bytes: number) => (bytes / (1024 * 1024 * 1024)).toFixed(2);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-4">
        <StatsCard
          icon={<Database className="h-6 w-6 text-primary" />}
          title="Database Size"
          value={stats?.databaseSize}
          unit="GB"
          isLoading={isLoading}
        />
        <StatsCard
          icon={<Server className="h-6 w-6 text-primary" />}
          title="API Status"
          value="Healthy"
          isLoading={isLoading}
        />
        <StatsCard
          icon={<HardDrive className="h-6 w-6 text-primary" />}
          title="Storage Used"
          value={stats?.storageUsed ? bytesToGB(stats.storageUsed) : 0}
          unit="GB"
          isLoading={isLoading}
        />
        <StatsCard
          icon={<Activity className="h-6 w-6 text-primary" />}
          title="System Load"
          value="Normal"
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">System Performance</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="load"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Storage Usage Trend</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="storage"
                  stroke="#82ca9d"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};