/**
 * ✅ NOTE DETAIL ROUTE - BEST PRACTICE
 *
 * Dynamic route for viewing/editing a specific note
 * Reuses PostBlock component in edit mode with proper data passing
 *
 * Route: /(drawer)/note-detail/[id]
 * 1. Loads note from AsyncStorage by ID
 * 2. Pre-fills PostBlock with note data
 * 3. User can edit and save changes
 * 4. Changes sync to AsyncStorage real-time
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import { getNoteById, Note } from '@/lib/storage/notes-storage';
import PostBlock from '@/components/ui/core/block/post-block';
import { ActivityIndicator, View } from 'react-native';
import { Text } from '@/components/ui/fragments/shadcn-ui/text';

/**
 * ✅ NOTE DETAIL PAGE
 * 
 * Responsibilities:
 * 1. Extract note ID from route params
 * 2. Load note from AsyncStorage
 * 3. Pass to PostBlock in edit mode
 * 4. Handle loading/error states
 */
export default function NoteDetailPage() {
  // ─────────────────────────────────────────────────────────────
  // 1️⃣ GET NOTE ID FROM ROUTE PARAMS
  // ─────────────────────────────────────────────────────────────
  const { id } = useLocalSearchParams<{ id: string }>();

  // ─────────────────────────────────────────────────────────────
  // 2️⃣ STATE
  // ─────────────────────────────────────────────────────────────
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────
  // 3️⃣ LOAD NOTE FROM STORAGE
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!id) {
      setError('No note ID provided');
      setIsLoading(false);
      return;
    }

    const loadNote = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('📚 Loading note:', id);

        const loadedNote = await getNoteById(id);

        if (!loadedNote) {
          setError('Note not found');
          console.warn('⚠️ Note not found:', id);
          setIsLoading(false);
          return;
        }

        setNote(loadedNote);
        console.log('✅ Note loaded successfully:', {
          id: loadedNote.id,
          title: loadedNote.title,
          contentLength: loadedNote.content.length,
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load note';
        setError(errorMsg);
        console.error('❌ Error loading note:', errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    loadNote();
  }, [id]);

  // ─────────────────────────────────────────────────────────────
  // 4️⃣ MEMOIZED HEADER TITLE
  // ─────────────────────────────────────────────────────────────

  const screenOptions = useMemo(() => {
    return {
      headerShown: false, // Use PostBlock's internal header
    };
  }, []);

  // ─────────────────────────────────────────────────────────────
  // 5️⃣ LOADING STATE
  // ─────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 6️⃣ ERROR STATE
  // ─────────────────────────────────────────────────────────────

  if (error || !note) {
    return (
      <View className="flex-1 items-center justify-center bg-background gap-4 px-6">
        <Text className="text-lg font-poppins_semibold text-destructive text-center">
          Error
        </Text>
        <Text className="text-center text-muted-foreground">
          {error || 'Note not found'}
        </Text>
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 7️⃣ SUCCESS: Pass note data to PostBlock in edit mode
  // ─────────────────────────────────────────────────────────────

  return (
    <>
      <Stack.Screen options={screenOptions} />
      {/* 
        ✅ KEY: Import PostBlock directly (not the wrapper)
        ✅ mode='edit' tells PostBlock this is an edit operation
        ✅ noteData={note} pre-fills the form with loaded note
      */}
      <PostBlock mode="edit" noteData={note} />
    </>
  );
}
