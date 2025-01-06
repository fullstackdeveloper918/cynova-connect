import { useRole } from "@/hooks/useRole";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { data: role, isLoading } = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAccess = async () => {
      // Wait for role to be loaded
      if (!isLoading && role !== "admin") {
        console.log("User role:", role); // Debug log
        toast.error("You don't have permission to access the admin panel");
        navigate("/dashboard");
      }
    };

    checkAdminAccess();
  }, [role, navigate, isLoading]);

  // Show loading state while checking role
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
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