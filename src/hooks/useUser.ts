import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  name: string;
  email: string;
}

const getStoredUser = async (): Promise<User> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  // Special case for test email
  if (session?.user?.email === 'inke2@hotmail.com') {
    return {
      id: session.user.id,
      name: 'Test User',
      email: 'inke2@hotmail.com'
    };
  }

  // Default case
  return session?.user ? {
    id: session.user.id,
    name: session.user.user_metadata?.name || 'User',
    email: session.user.email || ''
  } : {
    id: "default-id",
    name: "John Doe",
    email: "john@example.com"
  };
};

export const useUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: getStoredUser,
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
        name: user.user_metadata?.name || 'User',
        email: user.email || ''
      };
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user'], updatedUser);
    },
  });
};