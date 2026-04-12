/**
 * ✅ useNotesData HOOK
 *
 * Fetches user notes from AsyncStorage using TanStack React Query
 * Same pattern as quotes API, but from local storage
 *
 * Features:
 * - Real-time note list fetching
 * - Loading/error states
 * - Refetch on demand
 * - Cache invalidation
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllNotes, Note } from '@/lib/storage/notes-storage';

/**
 * ✅ QUERY KEY: For TanStack caching
 */
const NOTES_QUERY_KEY = ['notes'] as const;

/**
 * ✅ QUERY OPTIONS
 * Configuration for useQuery
 */
export function NotesListQueryOptions() {
  return {
    queryKey: NOTES_QUERY_KEY,
    queryFn: async (): Promise<Note[]> => {
      console.log('📚 Fetching notes from AsyncStorage...');
      const notes = await getAllNotes();
      console.log('✅ Notes fetched:', notes.length);
      return notes;
    },
    staleTime: 0, // Always refetch to get latest notes (since it's local)
    retry: 1,
    enabled: true,
  };
}

/**
 * ✅ useNotesData HOOK
 * Main hook for fetching notes
 */
export function useNotesData() {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery(
    NotesListQueryOptions()
  );

  return {
    notes: data ?? [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  };
}

/**
 * ✅ useInvalidateNotes HOOK
 * Invalidate cache to refetch notes after changes
 */
export function useInvalidateNotes() {
  const queryClient = useQueryClient();

  return () => {
    console.log('🔄 Invalidating notes cache...');
    queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
  };
}
