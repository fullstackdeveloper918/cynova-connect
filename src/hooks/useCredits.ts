import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface UserCredits {
  id: string;
  user_id: string;
  credits_balance: number;
  last_reset_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  transaction_type: string;
  created_at: string;
}

export const useCredits = () => {
  const queryClient = useQueryClient();

  const { data: credits, isLoading: isLoadingCredits } = useQuery({
    queryKey: ['credits'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .single();

      if (error) throw error;
      return data as UserCredits;
    },
  });

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['credit-transactions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CreditTransaction[];
    },
  });

  const useCredit = useMutation({
    mutationFn: async ({ amount, description }: { amount: number, description: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First check if user has enough credits
      const { data: credits, error: creditsError } = await supabase
        .from('user_credits')
        .select('credits_balance')
        .single();

      if (creditsError) throw creditsError;
      if (!credits || credits.credits_balance < amount) {
        throw new Error('Insufficient credits');
      }

      // Update credits balance
      const { error: updateError } = await supabase
        .from('user_credits')
        .update({ credits_balance: credits.credits_balance - amount })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Record transaction
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          amount: -amount,
          description,
          transaction_type: 'debit'
        });

      if (transactionError) throw transactionError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credits'] });
      queryClient.invalidateQueries({ queryKey: ['credit-transactions'] });
    },
    onError: (error) => {
      toast({
        title: "Error using credits",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    credits,
    transactions,
    isLoadingCredits,
    isLoadingTransactions,
    useCredit
  };
};