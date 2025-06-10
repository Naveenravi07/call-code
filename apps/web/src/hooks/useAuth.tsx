import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getUserData } from '@/apis/auth';
import { User } from '@/types/user';

const useAuth = () => {
  const queryClient = useQueryClient();
  const query = useQuery<User>({
    queryKey: ['user'],
    queryFn: async () => {
      const data = await getUserData();
      return data ;
    },
    retry: false,
  });
  const { data, error, isLoading, isError, isFetching } = query;

  function invalidateUser() {
    void queryClient.invalidateQueries({ queryKey: ['user'] });
  }

  return {
    user: data,
    error,
    isLoading,
    isError,
    isFetching,
    invalidate: invalidateUser,
  };
};

export default useAuth;
