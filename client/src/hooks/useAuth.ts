import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api, setTokens, clearTokens, getAccessToken } from '@/lib/api';
import { useCallback } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  restaurantId: number;
}

interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      api<{ data: AuthResponse }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    onSuccess: (response) => {
      setTokens(response.data.token, response.data.refreshToken);
      queryClient.setQueryData(['auth', 'user'], response.data.user);

      const role = response.data.user.role;
      if (role === 'admin' || role === 'superadmin') navigate('/admin');
      else if (role === 'cashier') navigate('/caja');
      else navigate('/mesero');
    },
  });

  const logout = useCallback(() => {
    clearTokens();
    queryClient.removeQueries();
    navigate('/login');
  }, [queryClient, navigate]);

  const isAuthenticated = () => getAccessToken() !== null;

  return {
    login: loginMutation.mutate,
    loginError: loginMutation.error as { code?: string; message?: string } | null,
    isLoginLoading: loginMutation.isPending,
    logout,
    isAuthenticated,
  };
}

export { useAuth };
export type { User, AuthResponse };
