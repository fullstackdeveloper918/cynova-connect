interface HealthIndicatorProps {
  name: string;
  status: "healthy" | "warning" | "error";
  latency: string;
}

export const HealthIndicator = ({
  name,
  status,
  latency,
}: HealthIndicatorProps) => {
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