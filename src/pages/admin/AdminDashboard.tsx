import { AdminLayout } from "@/components/admin/AdminLayout";

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="font-semibold">Total Users</h3>
            <p className="text-3xl font-bold mt-2">Loading...</p>
          </div>
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="font-semibold">Active Projects</h3>
            <p className="text-3xl font-bold mt-2">Loading...</p>
          </div>
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="font-semibold">Total Exports</h3>
            <p className="text-3xl font-bold mt-2">Loading...</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;