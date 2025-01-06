import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import type { Subscription } from "@/integrations/supabase/types";

export const useSubscription = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id ?? null);
    };
    getSession();
  }, []);

  return useQuery({
    queryKey: ['subscription', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      // Cast the plan_limits to PlanLimits type since we know the structure
      if (data) {
        return {
          ...data,
          plan_limits: data.plan_limits as unknown as PlanLimits
        } as Subscription;
      }
      return null;
    },
    enabled: !!userId,
  });
};