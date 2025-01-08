import { Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardOverview } from "./dashboard/DashboardOverview";
import { UpdatesManagement } from "./dashboard/UpdatesManagement";
import { ContentAnalytics } from "./dashboard/ContentAnalytics";
import { SystemHealthDashboard } from "./dashboard/SystemHealthDashboard";

export const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Settings className="h-6 w-6 text-muted-foreground" />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content Analytics</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
          <TabsTrigger value="updates">Updates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <DashboardOverview />
        </TabsContent>

        <TabsContent value="content">
          <ContentAnalytics />
        </TabsContent>

        <TabsContent value="system">
          <SystemHealthDashboard />
        </TabsContent>

        <TabsContent value="updates">
          <UpdatesManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};