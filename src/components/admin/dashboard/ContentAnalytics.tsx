import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { FileVideo, FolderOpen, HardDrive } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { StatsCard } from "./StatsCard";

interface ProjectTypeStats {
  type: string;
  count: number;
}

export const ContentAnalytics = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin", "content-stats"],
    queryFn: async () => {
      const [projectsCount, exportsCount, { data: storageData }] = await Promise.all([
        supabase.from("projects").select("id, type", { count: "exact" }),
        supabase.from("exports").select("id", { count: "exact" }),
        supabase.rpc('calculate_total_storage'),
      ]);

      // Calculate project type distribution
      const projectTypes = new Map<string, number>();
      projectsCount.data?.forEach((project) => {
        const count = projectTypes.get(project.type) || 0;
        projectTypes.set(project.type, count + 1);
      });

      const projectTypeStats: ProjectTypeStats[] = Array.from(projectTypes.entries()).map(
        ([type, count]) => ({
          type,
          count,
        })
      );

      return {
        totalProjects: projectsCount.count || 0,
        totalExports: exportsCount.count || 0,
        storageUsed: storageData || 0,
        projectTypeStats,
      };
    },
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  const bytesToGB = (bytes: number) => (bytes / (1024 * 1024 * 1024)).toFixed(2);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard
          icon={<FolderOpen className="h-6 w-6 text-primary" />}
          title="Total Projects"
          value={stats?.totalProjects}
          isLoading={isLoading}
        />
        <StatsCard
          icon={<FileVideo className="h-6 w-6 text-primary" />}
          title="Total Exports"
          value={stats?.totalExports}
          isLoading={isLoading}
        />
        <StatsCard
          icon={<HardDrive className="h-6 w-6 text-primary" />}
          title="Storage Used"
          value={stats?.storageUsed ? bytesToGB(stats.storageUsed) : 0}
          unit="GB"
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Project Types Distribution</h2>
          <div className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.projectTypeStats}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => entry.type}
                >
                  {stats?.projectTypeStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Storage Growth</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="storage"
                  stroke="#8884d8"
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