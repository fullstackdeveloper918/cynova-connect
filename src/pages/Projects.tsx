import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { ProjectsGrid } from "@/components/ProjectsGrid";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Projects = () => {
  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Your Projects</h1>
        <ProjectsGrid projects={projects} />
      </div>
    </DashboardLayout>
  );
};

export default Projects;