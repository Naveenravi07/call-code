import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface User {
  name: string;
  pfp?: string;
  // Add other user fields as needed
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// Query key for auth state
export const authQueryKey = ['auth'] as const;

// Function to fetch the current user
const fetchCurrentUser = async (): Promise<User | null> => {
  try {
    const { data } = await axios.get('/api/auth/me');
    return data;
  } catch (error) {
    return null;
  }
};

// Hook to access auth state
export const useAuth = () => {
  return useQuery<AuthState>({
    queryKey: authQueryKey,
    queryFn: async () => {
      const user = await fetchCurrentUser();
      return {
        user,
        isAuthenticated: !!user,
      };
    },
    // Don't refetch on window focus since we rely on cookie
    refetchOnWindowFocus: false,
    // But do retry on error in case of network issues
    retry: 2,
  });
};

// Hook to manage auth state
export const useAuthActions = () => {
  const queryClient = useQueryClient();

  const logout = async () => {
    try {
      // Call logout endpoint to clear the cookie
      await axios.post('/api/auth/logout');
      // Clear the user from query cache
      queryClient.setQueryData<AuthState>(authQueryKey, {
        user: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const invalidateAuth = () => {
    // Force a refetch of auth state
    queryClient.invalidateQueries({ queryKey: authQueryKey });
  };

  return {
    logout,
    invalidateAuth,
  };
}; 