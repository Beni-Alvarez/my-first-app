import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { songsApi } from '../api/songs';
import type { SongInput } from '../types/song';

export const songKeys = {
  all: ['songs'] as const,
  list: () => [...songKeys.all, 'list'] as const,
  detail: (id: string) => [...songKeys.all, 'detail', id] as const,
};

export function useSongs() {
  return useQuery({ queryKey: songKeys.list(), queryFn: songsApi.list });
}

export function useSong(id: string) {
  return useQuery({ queryKey: songKeys.detail(id), queryFn: () => songsApi.get(id) });
}

export function useCreateSong() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: songsApi.create,
    onSuccess: async (song) => {
      queryClient.setQueryData(songKeys.detail(song.id), song);
      await queryClient.invalidateQueries({ queryKey: songKeys.list() });
    },
  });
}

export function useUpdateSong(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SongInput) => songsApi.update(id, input),
    onSuccess: async (song) => {
      queryClient.setQueryData(songKeys.detail(id), song);
      await queryClient.invalidateQueries({ queryKey: songKeys.list() });
    },
  });
}

export function useDeleteSong() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: songsApi.remove,
    onSuccess: async (_data, id) => {
      queryClient.removeQueries({ queryKey: songKeys.detail(id) });
      await queryClient.invalidateQueries({ queryKey: songKeys.list() });
    },
  });
}
