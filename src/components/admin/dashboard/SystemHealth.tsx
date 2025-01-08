import { HealthIndicator } from "./HealthIndicator";

export const SystemHealth = () => {
  return (
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
  );
};