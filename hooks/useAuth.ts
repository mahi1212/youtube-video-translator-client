import { useMutation } from '@tanstack/react-query';
import { authService, type AuthResponse, type LoginRequest, type RegisterRequest } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/providers/auth-provider';

export const useLogin = () => {
  const { setToken } = useAuth();
  
  return useMutation<AuthResponse, Error, LoginRequest>({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setToken(data.token);
      toast.success('Logged in successfully!');
    },
    onError: (error) => {
      const message = error.message || 'Login failed';
      toast.error(message);
    },
  });
};

export const useRegister = () => {
  const { setToken } = useAuth();
  
  return useMutation<AuthResponse, Error, RegisterRequest>({
    mutationFn: authService.register,
    onSuccess: (data) => {
      setToken(data.token);
      toast.success('Registered successfully!');
    },
    onError: (error) => {
      const message = error.message || 'Registration failed';
      toast.error(message);
    },
  });
}; 