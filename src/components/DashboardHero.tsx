interface DashboardHeroProps {
  userName?: string;
}

export const DashboardHero = ({ userName = "User" }: DashboardHeroProps) => {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold text-primary">
        Welcome to Cynova, {userName}! 👋
      </h1>
      <p className="text-muted-foreground">
        Create and manage your video content with ease.
      </p>
    </div>
  );
};