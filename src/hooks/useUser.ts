import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface User {
  name: string;
  email: string;
}

const defaultUser: User = {
  name: "John Doe",
  email: "john@example.com"
};

export const useUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => defaultUser,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newUser: Partial<User>) => {
      // Here you would typically make an API call
      // For now, we'll just simulate an update
      const currentUser = queryClient.getQueryData<User>(['user']) || defaultUser;
      return { ...currentUser, ...newUser };
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user'], updatedUser);
    },
  });
};