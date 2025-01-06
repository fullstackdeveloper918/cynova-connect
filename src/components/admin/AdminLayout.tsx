import { useRole } from "@/hooks/useRole";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { data: role, isLoading } = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && role !== "admin") {
      toast.error("You don't have permission to access the admin panel");
      navigate("/dashboard");
    }
  }, [role, navigate, isLoading]);

  // Don't render anything while checking the role
  if (isLoading) return null;
  
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