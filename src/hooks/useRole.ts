import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "./useUser";

export type UserRole = 'admin' | 'user';

export const useRole = () => {
  const { data: user } = useUser();

  return useQuery({
    queryKey: ['role', user?.id],
    queryFn: async () => {
      console.log("Fetching role for user:", user?.id); // Debug log
      
      if (!user?.id) {
        console.log("No user ID available"); // Debug log
        return 'user' as UserRole;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user role:', error);
        return 'user' as UserRole;
      }

      console.log("Role data:", data); // Debug log
      return (data?.role || 'user') as UserRole;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1,
  });
};