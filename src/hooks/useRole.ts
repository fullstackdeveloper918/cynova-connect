import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "./useUser";

export type UserRole = 'admin' | 'user';

export const useRole = () => {
  const { data: user } = useUser();

  return useQuery({
    queryKey: ['role', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return 'user' as UserRole; // Default to user role if there's an error
      }

      return (data?.role || 'user') as UserRole;
    },
    enabled: !!user?.id,
  });
};