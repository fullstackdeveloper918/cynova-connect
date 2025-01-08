import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminSupabase } from "@/integrations/supabase/admin-client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, UserCog, MoreHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

type UserRole = "admin" | "user";

interface UserRoleData {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

export const UserManagement = () => {
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      // First, get all users through admin API
      const { data: { users: authUsers }, error: authError } = await adminSupabase.auth.admin.listUsers();
      if (authError) throw authError;

      // Then get their roles
      const { data: roles, error: rolesError } = await adminSupabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Combine the data
      return roles.map((role) => ({
        id: role.id,
        user_id: role.user_id,
        role: role.role as UserRole,
        created_at: role.created_at,
      }));
    },
  });

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const { error } = await adminSupabase
      .from("user_roles")
      .update({ role: newRole })
      .eq("user_id", userId);

    if (error) {
      toast({
        title: "Error updating role",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Role updated",
      description: "User role has been updated successfully.",
    });

    // Log admin action
    await adminSupabase.rpc("log_admin_action", {
      action: "update_user_role",
      entity_type: "user",
      entity_id: userId,
      details: { new_role: newRole },
    });
  };

  const handleDeleteUser = async (userId: string) => {
    // In a real application, this would need to handle cascading deletes
    // and proper user cleanup
    toast({
      title: "Not implemented",
      description: "User deletion is not implemented in this demo.",
      variant: "destructive",
    });
  };

  const handleExportUsers = () => {
    const csv = users
      ?.map((user) => `${user.user_id},${user.role},${user.created_at}`)
      .join("\n");
    
    const blob = new Blob([`User ID,Role,Created At\n${csv}`], {
      type: "text/csv",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
  };

  const filteredUsers = users?.filter((user) =>
    user.user_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">User Management</h1>
        <UserCog className="h-6 w-6 text-muted-foreground" />
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" onClick={handleExportUsers}>
          Export CSV
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              filteredUsers?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.user_id}</TableCell>
                  <TableCell>
                    <Select
                      defaultValue={user.role}
                      onValueChange={(value: UserRole) =>
                        handleRoleChange(user.user_id, value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            toast({
                              title: "View Details",
                              description: "User details view not implemented in demo",
                            });
                          }}
                        >
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteUser(user.user_id)}
                        >
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};