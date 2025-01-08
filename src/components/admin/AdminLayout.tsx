import { useRole } from "@/hooks/useRole";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { data: role, isLoading, error } = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate("/login");
      }
    });

    // Check role when not loading
    if (!isLoading) {
      console.log("AdminLayout - Current role:", role); // Debug log
      if (role !== "admin") {
        toast.error("You don't have permission to access the admin panel");
        navigate("/dashboard");
      }
    }

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [role, navigate, isLoading]);

  // Show loading state while checking role
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    console.error("Error fetching role:", error);
    return null;
  }

  // Only render children if user is admin
  if (role !== "admin") return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        {children}
      </div>
    </div>
  );
};