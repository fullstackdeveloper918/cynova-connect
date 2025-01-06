import { useRole } from "@/hooks/useRole";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { data: role } = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (role && role !== "admin") {
      navigate("/dashboard");
    }
  }, [role, navigate]);

  if (role !== "admin") return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        {children}
      </div>
    </div>
  );
};