import { AdminLayout } from "@/components/admin/AdminLayout";
import { UserManagement as Management } from "@/components/admin/UserManagement";

const UserManagement = () => {
  return (
    <AdminLayout>
      <Management />
    </AdminLayout>
  );
};

export default UserManagement;