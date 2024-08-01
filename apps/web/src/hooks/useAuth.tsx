import { useQuery } from '@tanstack/react-query';
import { getUserData } from '@/apis/auth';
import { User } from '@/types/user';

const useAuth = () => {
    const query = useQuery({
        queryKey: ['user'],
        queryFn: getUserData,
        enabled: document.cookie.includes('x-auth-cookie'),
        retry: false
    })
    const { data, error, isLoading, isError, isFetching } = query;
    
    return {
        user: data as User, 
        error, 
        isLoading, 
        isError, 
        isFetching, 
    };
};

export default useAuth;

