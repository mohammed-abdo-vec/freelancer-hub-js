// A normal protected feature. Notice: ZERO auth code in here.
// The token and the refresh are handled by http.js — this file just fetches.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '../../lib/http';

const notesKey = ['notes'];

export function useNotes() {
  return useQuery({
    queryKey: notesKey,
    queryFn: () => http.get('/notes').then((r) => r.data),
  });
}

export function useAddNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (text) => http.post('/notes', { text }).then((r) => r.data),
    // After the server saved it, mark the list stale → React Query refetches.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notesKey }),
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => http.delete(`/notes/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notesKey }),
  });
}
