import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface User {
  name: string;
  email: string;
}

const USER_STORAGE_KEY = 'user_data';

const getStoredUser = (): User => {
  const storedData = localStorage.getItem(USER_STORAGE_KEY);
  return storedData ? JSON.parse(storedData) : {
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
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data);
    },
  });
};