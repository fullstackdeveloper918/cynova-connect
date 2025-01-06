import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "./useUser";

export const useSubscription = () => {
  const { data: user, isLoading: isLoadingUser } = useUser();

  return useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      console.log("Fetching subscription for user:", user?.id);
      
      if (!user?.id || user.id === 'default-id') {
        console.log("No valid user ID available");
        return null;
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching subscriptions:", error);
        throw error;
      }

      return data;
    },
    enabled: !isLoadingUser && !!user?.id && user.id !== 'default-id',
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};