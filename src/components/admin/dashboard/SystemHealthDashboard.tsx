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

interface SystemMetric {
  metric_type: string;
  value: number;
  recorded_at: string;
  details: any;
}

export const SystemHealthDashboard = () => {
  // Fetch latest metrics
  const { data: latestMetrics, isLoading: isLoadingLatest } = useQuery({
    queryKey: ["admin", "latest-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_metrics")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  // Fetch metrics history for charts
  const { data: metricsHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["admin", "metrics-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_metrics")
        .select("*")
        .order("recorded_at", { ascending: true })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });

  // Process metrics for charts
  const performanceData = metricsHistory
    ?.filter((metric: SystemMetric) => metric.metric_type === "cpu_usage")
    .map((metric: SystemMetric) => ({
      timestamp: new Date(metric.recorded_at).toLocaleTimeString(),
      load: metric.value,
    }));

  const storageData = metricsHistory
    ?.filter((metric: SystemMetric) => metric.metric_type === "storage_usage")
    .map((metric: SystemMetric) => ({
      timestamp: new Date(metric.recorded_at).toLocaleTimeString(),
      storage: metric.value / (1024 * 1024 * 1024), // Convert to GB
    }));

  const getLatestMetricValue = (type: string) => {
    return metricsHistory?.find((m: SystemMetric) => m.metric_type === type)?.value || 0;
  };

  const formatStorageSize = (bytes: number) => {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-4">
        <StatsCard
          icon={<Database className="h-6 w-6 text-primary" />}
          title="Database Size"
          value={formatStorageSize(getLatestMetricValue("storage_usage"))}
          unit="GB"
          isLoading={isLoadingLatest}
        />
        <StatsCard
          icon={<Server className="h-6 w-6 text-primary" />}
          title="API Latency"
          value={Math.round(getLatestMetricValue("api_latency"))}
          unit="ms"
          isLoading={isLoadingLatest}
        />
        <StatsCard
          icon={<HardDrive className="h-6 w-6 text-primary" />}
          title="CPU Usage"
          value={Math.round(getLatestMetricValue("cpu_usage"))}
          unit="%"
          isLoading={isLoadingLatest}
        />
        <StatsCard
          icon={<Activity className="h-6 w-6 text-primary" />}
          title="Memory Usage"
          value={Math.round(getLatestMetricValue("memory_usage"))}
          unit="%"
          isLoading={isLoadingLatest}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">System Performance</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
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
              <LineChart data={storageData}>
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