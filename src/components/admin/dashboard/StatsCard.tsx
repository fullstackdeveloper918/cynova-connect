import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value?: number | string;
  isLoading?: boolean;
  unit?: string;
}

export const StatsCard = ({
  icon,
  title,
  value,
  isLoading,
  unit,
}: StatsCardProps) => (
  <Card className="p-6">
    <div className="flex items-center gap-4">
      <div className="rounded-lg bg-primary/10 p-3">{icon}</div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {isLoading ? (
          <Skeleton className="h-7 w-20" />
        ) : (
          <p className="text-2xl font-bold">
            {typeof value === 'number' ? value.toLocaleString() : value}
            {unit && <span className="text-sm font-normal ml-1">{unit}</span>}
          </p>
        )}
      </div>
    </div>
  </Card>
);