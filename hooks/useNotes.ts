import { useCallback, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  createNote,
  updateNote,
  deleteNote,
  getAllNotes,
  getNoteById,
  Note,
} from '@/lib/storage/notes-storage';

/**
 * ✅ CUSTOM HOOK: useNotes
 *
 * Handles all note operations dengan state management yang clean
 * - Separates business logic dari UI logic
 * - Easy to test dan reuse
 * - Built-in loading/error states
 */

interface UseNotesReturn {
  // State
  notes: Note[];
  isLoading: boolean;
  error: string | null;

  // Operations
  saveNote: (title: string, content: string, noteId?: string) => Promise<Note | null>;
  removeNote: (id: string) => Promise<boolean>;
  loadAllNotes: () => Promise<void>;
  clearError: () => void;
}

export function useNotes(): UseNotesReturn {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ QUERY CLIENT: For cache invalidation
  const queryClient = useQueryClient();

  /**
   * ✅ INIT: Load notes saat mount
   */
  useEffect(() => {
    loadAllNotes();
  }, []);

  /**
   * ✅ Load all notes dari storage
   */
  const loadAllNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allNotes = await getAllNotes();
      setNotes(allNotes);
      console.log('✅ Notes loaded:', allNotes.length);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load notes';
      setError(errorMsg);
      console.error('❌ loadAllNotes:', errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * ✅ SAVE NOTE: Create or Update
   * @param title - Title note
   * @param content - Content note
   * @param noteId - Jika ada, update; jika tidak, create
   */
  const saveNote = useCallback(
    async (title: string, content: string, noteId?: string): Promise<Note | null> => {
      try {
        setIsLoading(true);
        setError(null);

        let savedNote: Note | null;

        if (noteId) {
          // UPDATE
          console.log('📝 Updating note:', noteId);
          savedNote = await updateNote(noteId, title, content);
        } else {
          // CREATE
          console.log('✨ Creating new note');
          savedNote = await createNote(title, content);
        }

        // Reload notes dari storage untuk sync
        await loadAllNotes();

        // ✅ INVALIDATE QUERY CACHE: So list view updates
        queryClient.invalidateQueries({ queryKey: ['notes'] });

        return savedNote;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to save note';
        setError(errorMsg);
        console.error('❌ saveNote:', errorMsg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [loadAllNotes, queryClient]
  );

  /**
   * ✅ DELETE NOTE
   */
  const removeNote = useCallback(async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const success = await deleteNote(id);

      if (success) {
        // Update local state immediately untuk UX yang lebih smooth
        setNotes((prev) => prev.filter((n) => n.id !== id));
        console.log('✅ Note deleted locally');

        // ✅ INVALIDATE QUERY CACHE: So list view updates
        queryClient.invalidateQueries({ queryKey: ['notes'] });
      }

      return success;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete note';
      setError(errorMsg);
      console.error('❌ removeNote:', errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [queryClient]);

  /**
   * ✅ CLEAR ERROR
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    notes,
    isLoading,
    error,
    saveNote,
    removeNote,
    loadAllNotes,
    clearError,
  };
}
