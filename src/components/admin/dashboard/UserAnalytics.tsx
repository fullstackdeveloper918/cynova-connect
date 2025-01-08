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

export const UserAnalytics = () => {
  // Fetch user statistics
  const { data: stats } = useQuery({
    queryKey: ["admin", "user-stats"],
    queryFn: async () => {
      // Get all users through roles table
      const { data: allUsers, error: usersError } = await supabase
        .from('user_roles')
        .select('user_id, created_at');
      
      if (usersError) throw usersError;

      // Get active users (users who signed up within last 24h)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: activeUsers, error: activeError } = await supabase
        .from('user_roles')
        .select('user_id')
        .gt('created_at', oneDayAgo);

      if (activeError) throw activeError;

      return {
        total_users: allUsers?.length || 0,
        active_users: activeUsers?.length || 0,
        inactive_users: (allUsers?.length || 0) - (activeUsers?.length || 0),
        users_last_day: activeUsers?.length || 0,
      } as UserStats;
    },
  });

  // Fetch detailed user information
  const { data: users } = useQuery({
    queryKey: ["admin", "user-details"],
    queryFn: async () => {
      // Get user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role,
          created_at
        `);

      if (rolesError) throw rolesError;

      // Get subscriptions
      const { data: subscriptions, error: subsError } = await supabase
        .from('subscriptions')
        .select('user_id, status');

      if (subsError) throw subsError;

      // Combine data
      return userRoles.map(user => ({
        id: user.user_id,
        email: user.user_id, // Note: We can't get email directly due to auth restrictions
        last_sign_in_at: "N/A", // We don't have this information in user_roles
        created_at: user.created_at,
        role: user.role,
        subscription_status: subscriptions?.find(s => s.user_id === user.user_id)?.status || null,
      })) as UserDetail[];
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