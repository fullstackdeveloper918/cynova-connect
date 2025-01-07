import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Folder, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SidebarNavigation } from "@/components/sidebar/SidebarNavigation";
import { ProjectsGrid } from "@/components/ProjectsGrid";
import { useToast } from "@/hooks/use-toast";
import { RequireSubscription } from "@/components/auth/RequireSubscription";

const Projects = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      }
    };
    checkAuth();
  }, [navigate]);

  // Fetch projects
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error fetching projects",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data || [];
    },
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="hidden md:block">
          <SidebarHeader className="p-6">
            <img
              src="/logo.svg"
              alt="Cynova Logo"
              className="w-48 h-auto mx-auto"
            />
          </SidebarHeader>
          <SidebarNavigation />
        </Sidebar>

        <main className="flex-1">
          <div className="p-4 md:hidden">
            <SidebarTrigger />
          </div>
          
          <RequireSubscription>
            <div className="p-6">
              <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
                    <p className="text-muted-foreground">
                      Manage and organize all your Cynova video projects
                    </p>
                  </div>
                  <Button onClick={() => navigate("/dashboard/editor")} className="hidden sm:flex">
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                  </Button>
                </div>

                {/* Mobile Create Button */}
                <Button 
                  onClick={() => navigate("/dashboard/editor")} 
                  className="w-full sm:hidden"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Button>

                {/* Content */}
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <Folder className="h-16 w-16 text-muted-foreground" />
                    <p className="text-muted-foreground">Failed to load projects</p>
                    <Button onClick={() => window.location.reload()} variant="outline">
                      Try Again
                    </Button>
                  </div>
                ) : projects?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <Folder className="h-16 w-16 text-muted-foreground" />
                    <p className="text-muted-foreground">No projects yet</p>
                    <Button onClick={() => navigate("/dashboard/editor")} variant="outline">
                      Create Your First Project
                    </Button>
                  </div>
                ) : (
                  <ProjectsGrid projects={projects} />
                )}
              </div>
            </div>
          </RequireSubscription>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Projects;