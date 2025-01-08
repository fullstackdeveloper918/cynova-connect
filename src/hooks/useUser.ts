import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  name: string;
  email: string;
  user_metadata?: {
    name?: string;
  };
}

const getStoredUser = async (): Promise<User> => {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    throw sessionError;
  }

  if (!session?.user) {
    throw new Error("No authenticated user found");
  }

  // Verify the session is valid
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user || user.id !== session.user.id) {
    // Invalid session, clear it
    await supabase.auth.signOut();
    throw new Error("Invalid session detected");
  }

  return {
    id: session.user.id,
    name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
    email: session.user.email || '',
    user_metadata: session.user.user_metadata
  };
};

export const useUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: getStoredUser,
    retry: false, // Don't retry on error as it might be an invalid session
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newUser: Partial<User>) => {
      const { data: { user }, error } = await supabase.auth.updateUser({
        data: { name: newUser.name }
      });

      if (error) {
        throw error;
      }

      if (!user) {
        throw new Error('Failed to update user');
      }

      return {
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        user_metadata: user.user_metadata
      };
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user'], updatedUser);
    },
  });
};