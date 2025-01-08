import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "./useUser";

export type UserRole = 'admin' | 'user';

export const useRole = () => {
  const { data: user, isLoading: isLoadingUser } = useUser();

  return useQuery({
    queryKey: ['role', user?.id],
    queryFn: async () => {
      // Only proceed if we have a valid UUID
      if (!user?.id || user.id === 'default-id') {
        console.log("No valid user ID available, defaulting to 'user' role"); 
        return 'user' as UserRole;
      }

      console.log("Fetching role for user:", user.id);
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user role:', error);
        throw error;
      }

      console.log("Role data:", data);
      return (data?.role || 'user') as UserRole;
    },
    enabled: !isLoadingUser && !!user?.id && user.id !== 'default-id',
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2, // Retry twice if the query fails
  });
};