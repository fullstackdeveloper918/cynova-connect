import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminDashboard as Dashboard } from "@/components/admin/AdminDashboard";

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <Dashboard />
    </AdminLayout>
  );
};

export default AdminDashboard;