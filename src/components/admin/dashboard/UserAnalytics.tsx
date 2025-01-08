import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Users, UserCheck, Clock, UserX } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface UserStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  users_last_day: number;
}

interface UserDetail {
  id: string;
  email: string;
  last_sign_in_at: string;
  created_at: string;
  role: string;
  subscription_status: string | null;
}

interface AdminUser {
  id: string;
  email: string | null;
  last_sign_in_at: string | null;
  created_at: string;
}

export const UserAnalytics = () => {
  // Fetch user statistics
  const { data: stats } = useQuery({
    queryKey: ["admin", "user-stats"],
    queryFn: async () => {
      // Get all users through admin API
      const { data: allUsers, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) throw usersError;

      // Get active users (users who have logged in within last 24h)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const activeUsers = allUsers.users.filter((user: AdminUser) => {
        const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at) : null;
        return lastSignIn && lastSignIn > oneDayAgo;
      });

      return {
        total_users: allUsers.users.length,
        active_users: activeUsers.length,
        inactive_users: allUsers.users.length - activeUsers.length,
        users_last_day: activeUsers.length,
      } as UserStats;
    },
  });

  // Fetch detailed user information
  const { data: users } = useQuery({
    queryKey: ["admin", "user-details"],
    queryFn: async () => {
      // Get all users through admin API
      const { data: allUsers, error: usersError } = await supabase.auth.admin.listUsers();
      if (usersError) throw usersError;

      // Get user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Get subscriptions
      const { data: subscriptions, error: subsError } = await supabase
        .from('subscriptions')
        .select('user_id, status');

      if (subsError) throw subsError;

      // Combine data
      return allUsers.users.map((user: AdminUser) => {
        const userRole = userRoles?.find(r => r.user_id === user.id);
        return {
          id: user.id,
          email: user.email || 'No email',
          last_sign_in_at: user.last_sign_in_at || 'Never',
          created_at: user.created_at,
          role: userRole?.role || 'user',
          subscription_status: subscriptions?.find(s => s.user_id === user.id)?.status || null,
        };
      }) as UserDetail[];
    },
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Total Users</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{stats?.total_users || 0}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Active Users</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{stats?.active_users || 0}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <UserX className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Inactive Users</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{stats?.inactive_users || 0}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Active Last 24h</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{stats?.users_last_day || 0}</p>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="mb-4 text-lg font-medium">User Details</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Last Sign In</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === "admin" ? "destructive" : "default"}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.subscription_status ? (
                    <Badge variant="outline">{user.subscription_status}</Badge>
                  ) : (
                    <Badge variant="secondary">Free</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {user.last_sign_in_at === "Never"
                    ? "Never"
                    : new Date(user.last_sign_in_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};