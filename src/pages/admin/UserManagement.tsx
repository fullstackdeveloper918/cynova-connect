import { AdminLayout } from "@/components/admin/AdminLayout";

const UserManagement = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <div className="rounded-lg border">
          <div className="p-6">
            <p className="text-muted-foreground">User management features coming soon...</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserManagement;