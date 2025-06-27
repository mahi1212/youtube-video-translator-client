import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, type User, type UsageHistoryItem, type UpdateApiKeyRequest, type EditTextRequest, type RemakeAudioRequest } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/providers/auth-provider';

// Query Keys
export const userKeys = {
  all: ['user'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
  history: () => [...userKeys.all, 'history'] as const,
  historyAudio: (historyId: string) => [...userKeys.all, 'history', historyId, 'audio'] as const,
};

export const useUserProfile = () => {
  const { token, isClient } = useAuth();
  
  return useQuery<User, Error>({
    queryKey: userKeys.profile(),
    queryFn: userService.getProfile,
    enabled: isClient && !!token,
    retry: false,
  });
};

export const useUserHistory = () => {
  const { token, isClient } = useAuth();
  
  return useQuery<UsageHistoryItem[], Error>({
    queryKey: userKeys.history(),
    queryFn: userService.getHistory,
    enabled: isClient && !!token,
    retry: false,
  });
};

export const useHistoryAudio = (historyId: string | null) => {
  const { token, isClient } = useAuth();
  
  return useQuery<{ initialAudioData: string | null; targetAudioData: string | null }, Error>({
    queryKey: userKeys.historyAudio(historyId || ''),
    queryFn: () => userService.getHistoryAudio(historyId!),
    enabled: isClient && !!historyId && !!token,
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

export const useEditText = () => {
  const queryClient = useQueryClient();
  
  return useMutation<UsageHistoryItem, Error, { historyId: string } & EditTextRequest>({
    mutationFn: ({ historyId, ...data }) => userService.editText(historyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.history() });
      toast.success('Text updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update text');
    },
  });
};

export const useRetranslate = () => {
  const queryClient = useQueryClient();
  
  return useMutation<UsageHistoryItem, Error, string>({
    mutationFn: (historyId) => userService.retranslate(historyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.history() });
      toast.success('Text re-translated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to re-translate');
    },
  });
};

export const useRemakeAudio = () => {
  const queryClient = useQueryClient();
  
  return useMutation<UsageHistoryItem, Error, { historyId: string } & RemakeAudioRequest>({
    mutationFn: ({ historyId, ...data }) => userService.remakeAudio(historyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.history() });
      toast.success('Audio regenerated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to regenerate audio');
    },
  });
}; 