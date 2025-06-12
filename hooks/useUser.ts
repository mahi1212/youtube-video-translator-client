import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, type User, type UsageHistoryItem, type UpdateApiKeyRequest } from '@/lib/api';
import { toast } from 'sonner';

// Query Keys
export const userKeys = {
  all: ['user'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
  history: () => [...userKeys.all, 'history'] as const,
};

export const useUserProfile = () => {
  return useQuery<User, Error>({
    queryKey: userKeys.profile(),
    queryFn: userService.getProfile,
    enabled: !!localStorage.getItem('token'),
    retry: false,
  });
};

export const useUserHistory = () => {
  return useQuery<UsageHistoryItem[], Error>({
    queryKey: userKeys.history(),
    queryFn: userService.getHistory,
    enabled: !!localStorage.getItem('token'),
    retry: false,
  });
};

export const useUpdateApiKey = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, UpdateApiKeyRequest>({
    mutationFn: userService.updateApiKey,
    onSuccess: () => {
      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
      toast.success('API key updated successfully');
    },
    onError: (error) => {
      const message = error.message || 'Failed to update API key';
      toast.error(message);
    },
  });
}; 