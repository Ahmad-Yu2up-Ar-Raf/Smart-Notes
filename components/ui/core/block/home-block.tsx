/**
 * ✅ HOME BLOCK: Display user notes
 *
 * Features:
 * - Fetches user notes from AsyncStorage
 * - Displays in LegendList (optimized list)
 * - Each note in a minimalist NoteCard
 * - Edit/Delete actions via dropdown
 * - Pull-to-refresh functionality
 * - Loading/Error states
 */

import React, { useCallback } from 'react';
import { Wrapper } from '../layout/wrapper';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Text } from '../../fragments/shadcn-ui/text';
import { NotesListQueryOptions } from '@/hooks/useNotesData';
import { deleteNote } from '@/lib/storage/notes-storage';
import LoadingIndicator from '../loading-indicator';
import { RefreshControl, View } from 'react-native';
import { LegendList } from '@legendapp/list';
import { NoteCard } from '../../fragments/custom-ui/card/note-card';
import { Button } from '../../fragments/shadcn-ui/button';
import LottieView from 'lottie-react-native';
import { Icon } from '../../fragments/shadcn-ui/icon';
import { RotateCwIcon, PlusIcon } from 'lucide-react-native';
import { router } from 'expo-router';
import { useToast } from '../../fragments/shadcn-ui/toast';

export default function HomeBlock() {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery(NotesListQueryOptions());
  const queryClient = useQueryClient();
  const { error: showError } = useToast();

  // ─────────────────────────────────────────────────────────────
  // DELETE NOTE HANDLER
  // ─────────────────────────────────────────────────────────────

  /**
   * ✅ DELETE NOTE: Call storage function
   * Query cache will be invalidated by useNotes hook
   */
  const handleDeleteNote = useCallback(
    async (noteId: string) => {
      try {
        const success = await deleteNote(noteId);
        if (success) {
          // Refetch to update list
          await refetch();
        }
      } catch (error) {
        console.error('❌ Delete failed:', error);
        showError('Error', 'Failed to delete note');
      }
    },
    [refetch, showError]
  );

  // ─────────────────────────────────────────────────────────────
  // NEW NOTE BUTTON
  // ─────────────────────────────────────────────────────────────

  /**
   * ✅ NAVIGATE TO CREATE NEW NOTE
   */
  const handleNewNote = useCallback(() => {
    router.push('/(drawer)/post');
  }, []);

  // ─────────────────────────────────────────────────────────────
  // LOADING STATE
  // ─────────────────────────────────────────────────────────────

  if (isLoading) {
    return <LoadingIndicator />;
  }

  // ─────────────────────────────────────────────────────────────
  // ERROR STATE
  // ─────────────────────────────────────────────────────────────

  if (isError) {
    return (
      <Wrapper
        className="flex-1 content-center items-center justify-center"
        edges={['bottom', 'left', 'right']}>
        <LottieView
          autoPlay
          style={{
            width: 200,
            height: 200,
          }}
          source={require('@/assets/animations/error.json')}
        />
        <Text className="mb-2 text-center text-muted-foreground">Failed to load notes</Text>
        <Button
          disabled={isRefetching}
          size={'lg'}
          className="gap-2"
          onPress={() => {
            refetch();
          }}>
          <View className="h-full w-fit flex-row items-center justify-center gap-3">
            <Text className="font-poppins_medium text-sm">Try again</Text>
            {isRefetching ? (
              <LoadingIndicator />
            ) : (
              <Icon className="text-primary-foreground" as={RotateCwIcon} />
            )}
          </View>
        </Button>
      </Wrapper>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // EMPTY STATE
  // ─────────────────────────────────────────────────────────────

  if (!data || data.length === 0) {
    return (
      <Wrapper
        className="flex-1 content-center items-center justify-center"
        edges={['bottom', 'left', 'right']}>
        <LottieView
          autoPlay
          style={{
            width: 200,
            height: 200,
          }}
          source={require('@/assets/animations/error.json')}
        />
        <Text className="mb-4 text-center text-muted-foreground">No notes yet</Text>
        <Button size={'lg'} className="gap-2" onPress={handleNewNote}>
          <Icon className="text-primary-foreground" as={PlusIcon} />
          <Text className="font-poppins_medium text-sm">Create a note</Text>
        </Button>
      </Wrapper>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // NOTES LIST
  // ─────────────────────────────────────────────────────────────

  return (
    <LegendList
      data={data}
      renderItem={({ item, index }) => (
        <NoteCard index={index} note={item} onDelete={handleDeleteNote} />
      )}
      keyExtractor={(item, index) => `note-${item.id}-${index}`}
      numColumns={1}
      onEndReachedThreshold={1.5}
      contentContainerStyle={{
        paddingTop: 30,
        gap: 12,
        paddingBottom: 100,
      }}
      className="px-7"
      // ✅ Pull to refresh
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      maintainVisibleContentPosition
      recycleItems
      showsVerticalScrollIndicator={false}
    />
  );
}
