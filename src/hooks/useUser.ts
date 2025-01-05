import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface User {
  id: string;
  name: string;
  email: string;
}

const getStoredUser = (): User => {
  const storedUser = localStorage.getItem('user');
  return storedUser ? JSON.parse(storedUser) : {
    id: "default-id", // Added id field
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
      const currentUser = queryClient.getQueryData<User>(['user']) || getStoredUser();
      const updatedUser = { ...currentUser, ...newUser };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user'], updatedUser);
    },
  });
};