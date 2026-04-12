import React, { useState, useRef, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { SCREEN_OPTIONS, ScreenOptionsParams } from '@/components/ui/core/layout/nav';
import { router, Stack } from 'expo-router';
import { ChevronLeftIcon, MoreHorizontalIcon } from 'lucide-react-native';
import { Wrapper } from '../layout/wrapper';
import { batasiHuruf, batasiKata } from '@/hooks/useWord';
import { Textarea } from '../../fragments/shadcn-ui/textarea';
import { useNotes } from '@/hooks/useNotes';
import { useToast } from '../../fragments/shadcn-ui/toast';
import { deleteNote, Note } from '@/lib/storage/notes-storage';
import {
  ActivityIndicator,
  View,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput,
  Keyboard,
  ScrollView,
} from 'react-native';
import { Button } from '../../fragments/shadcn-ui/button';
import { Text } from '../../fragments/shadcn-ui/text';
import { Icon } from '../../fragments/shadcn-ui/icon';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../fragments/shadcn-ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../fragments/shadcn-ui/dropdown-menu';

/**
 * ✅ TYPE DEFINITIONS
 * Complete type safety - zero `any` types
 */
interface TextInputRef extends RNTextInput {}

interface TextState {
  title: string;
  content: string;
}

export interface PostBlockProps {
  mode?: 'create' | 'edit'; // Default: 'create'
  noteData?: Note; // For edit mode - pre-fill data
}

/**
 * ✅ PostBlock Component - IMPROVED VERSION
 *
 * ✨ FEATURES:
 * 1. ✅ Create & Edit modes (reusable)
 * 2. ✅ Keyboard always above text (high offset)
 * 3. ✅ Dropdown menu (save/reset/delete)
 * 4. ✅ NO HEIGHT FLICKER (ref-based heights)
 * 5. ✅ Toast feedback for all actions
 * 6. ✅ Optimistic UI (instant feedback)
 * 7. ✅ Smooth animations
 * 8. ✅ 100% type safe
 */
export default function PostBlock({ mode = 'create', noteData }: PostBlockProps) {
  // ─────────────────────────────────────────────────────────────
  // 1️⃣ STATE MANAGEMENT (Only for content, not heights!)
  // ─────────────────────────────────────────────────────────────
  const [postText, setPostText] = useState<TextState>({
    title: noteData?.title ?? '',
    content: noteData?.content ?? '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // ✅ Pre-calculate initial heights from noteData to prevent visible changes
  const [titleHeight, setTitleHeight] = useState(() => {
    const titleText = noteData?.title ?? '';
    return titleText.length > 40 ? 80 : 60;
  });
  const [contentHeight, setContentHeight] = useState(() => {
    const contentText = noteData?.content ?? '';
    const lineCount = (contentText.match(/\n/g) || []).length + 1;
    return Math.max(200, lineCount * 24);
  });

  // ─────────────────────────────────────────────────────────────
  // 2️⃣ REFS (No state for heights - prevents flicker!)
  // ─────────────────────────────────────────────────────────────
  const titleInputRef = useRef<TextInputRef>(null);
  const contentInputRef = useRef<TextInputRef>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Track initial text for discard detection
  const initialStateRef = useRef<TextState>({
    title: noteData?.title ?? '',
    content: noteData?.content ?? '',
  });



  // ─────────────────────────────────────────────────────────────
  // 3️⃣ HOOKS
  // ─────────────────────────────────────────────────────────────
  const { saveNote } = useNotes();
  const { success, error: showError } = useToast();

  // ─────────────────────────────────────────────────────────────
  // 4️⃣ MEMOIZED VALUES
  // ─────────────────────────────────────────────────────────────
  const displayTitle = useMemo(() => {
    if (mode === 'edit') {
      return 'Edit Note';
    }
    const truncated = batasiHuruf(postText.title, 10);
    return batasiKata(truncated, 2) || 'New Note';
  }, [postText.title, mode]);

  const hasChanges = useMemo(
    () =>
      postText.title.trim() !== initialStateRef.current.title.trim() ||
      postText.content.trim() !== initialStateRef.current.content.trim(),
    [postText]
  );

  // ─────────────────────────────────────────────────────────────
  // 5️⃣ AUTO FOCUS & CLEANUP
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      titleInputRef.current?.focus();
      console.log('✅ Auto focused to title input');
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  // ✅ Recalculate heights when noteData changes (edit mode)
  useEffect(() => {
    if (mode === 'edit' && noteData) {
      const titleText = noteData.title ?? '';
      const contentText = noteData.content ?? '';
      
      // Pre-calculate heights to prevent visible changes
      const newTitleHeight = titleText.length > 40 ? 80 : 60;
      const lineCount = (contentText.match(/\n/g) || []).length + 1;
      const newContentHeight = Math.max(200, lineCount * 24);
      
      setTitleHeight(newTitleHeight);
      setContentHeight(newContentHeight);
    }
  }, [mode, noteData]);

  // ─────────────────────────────────────────────────────────────
  // 6️⃣ TEXT CHANGE HANDLERS (Memoized for stability)
  // ─────────────────────────────────────────────────────────────
  const handleTitleChange = useCallback((text: string) => {
    // Remove newlines from title
    const cleanedText = text.replace(/\n/g, '');
    setPostText((prev) => ({ ...prev, title: cleanedText }));
    console.log('📝 Title:', cleanedText.substring(0, 20) || '(empty)');
  }, []);

  const handleContentChange = useCallback((text: string) => {
    setPostText((prev) => ({ ...prev, content: text }));
    console.log('📝 Content updated');
  }, []);

  // ─────────────────────────────────────────────────────────────
  // 7️⃣ DYNAMIC HEIGHT HANDLERS (Debounced to prevent flashing!)
  // ─────────────────────────────────────────────────────────────
  const titleHeightTimerRef = useRef<NodeJS.Timeout | number | null>(null);
  const contentHeightTimerRef = useRef<NodeJS.Timeout | number | null>(null);

  const handleTitleHeightChange = useCallback(
    (event: { nativeEvent: { contentSize: { height: number } } }) => {
      const newHeight = Math.max(60, event.nativeEvent.contentSize.height);
      
      // ✅ Debounce height updates (16ms = one frame)
      if (titleHeightTimerRef.current) {
        clearTimeout(titleHeightTimerRef.current);
      }
      
      titleHeightTimerRef.current = setTimeout(() => {
        setTitleHeight(newHeight);
      }, 16);
    },
    []
  );

  const handleContentHeightChange = useCallback(
    (event: { nativeEvent: { contentSize: { height: number } } }) => {
      const newHeight = Math.max(200, event.nativeEvent.contentSize.height);
      
      // ✅ Debounce height updates (16ms = one frame)
      if (contentHeightTimerRef.current) {
        clearTimeout(contentHeightTimerRef.current);
      }
      
      contentHeightTimerRef.current = setTimeout(() => {
        setContentHeight(newHeight);
      }, 16);
    },
    []
  );

  // ✅ Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (titleHeightTimerRef.current) clearTimeout(titleHeightTimerRef.current);
      if (contentHeightTimerRef.current) clearTimeout(contentHeightTimerRef.current);
    };
  }, []);



  // ─────────────────────────────────────────────────────────────
  // 8️⃣ TITLE KEY PRESS (Enter -> move to content with proper timing!)
  // ─────────────────────────────────────────────────────────────
  const handleTitleKeyPress = useCallback((e: { nativeEvent: { key: string } }) => {
    if (e.nativeEvent.key === 'Enter') {
      // ✅ Use requestAnimationFrame to focus AFTER render completes
      // This prevents the content from disappearing
      requestAnimationFrame(() => {
        contentInputRef.current?.focus();
        console.log('➡️ Focus moved to content');
      });
    }
  }, []);

  // ─────────────────────────────────────────────────────────────
  // 8️⃣B AUTO-SCROLL WHEN CONTENT TEXTAREA FOCUSED
  // ─────────────────────────────────────────────────────────────
  const handleContentFocus = useCallback(() => {
    // Scroll to content textarea position (approximately 130 offset for title + spacing)
    scrollViewRef.current?.scrollTo({
      y: 130,
      animated: true,
    });
    console.log('📍 Scrolled to content textarea');
  }, []);

  // ─────────────────────────────────────────────────────────────
  // 9️⃣ SAVE NOTE (Optimistic UI + Toast)
  // ─────────────────────────────────────────────────────────────
  const handleSaveNote = useCallback(async () => {
    try {
      const title = postText.title.trim();
      const content = postText.content.trim();

      if (!title) {
        showError('Oops', 'Title cannot be empty');
        return;
      }

      if (!content) {
        showError('Oops', 'Content cannot be empty');
        return;
      }

      // ✅ OPTIMISTIC UI: Show loading immediately
      setIsSaving(true);
      console.log('💾 Saving note...');

      // Fire-and-forget: Don't wait for response
      requestAnimationFrame(async () => {
        try {
          // ✅ CALL saveNote: Handles both create AND update
          // Pass noteData?.id if editing, undefined if creating
          const result = await saveNote(title, content, mode === 'edit' ? noteData?.id : undefined);

          if (result) {
            console.log('✅ Note saved:', result.id);

            // Clear form (if creating)
            if (mode === 'create') {
              setPostText({ title: '', content: '' });
              initialStateRef.current = { title: '', content: '' };
              setTitleHeight(60);
              setContentHeight(200);
            } else {
              // If editing, update initialState to current state (no more changes)
              initialStateRef.current = { title, content };
            }



            // Show success
            success('Saved!', mode === 'edit' ? 'Note updated' : 'Your note has been saved');

            // Navigate back after short delay
            setTimeout(() => router.back(), 500);
          }
        } catch (error) {
          console.error('❌ Save error:', error);
          showError('Failed', 'Could not save note. Try again.');
        } finally {
          setIsSaving(false);
        }
      });
    } catch (error) {
      console.error('❌ Save error:', error);
      showError('Error', 'Something went wrong');
      setIsSaving(false);
    }
  }, [postText, saveNote, success, showError, mode, noteData?.id]);

  // ─────────────────────────────────────────────────────────────
  // 🔟 RESET NOTE (Clear all content or revert changes)
  // ─────────────────────────────────────────────────────────────
  const handleResetNote = useCallback(() => {
    if (mode === 'edit') {
      // ✅ EDIT MODE: Revert to original note data
      setPostText({
        title: noteData?.title ?? '',
        content: noteData?.content ?? '',
      });
      success('Reverted', 'Changes discarded');
    } else {
      // ✅ CREATE MODE: Clear all content
      setPostText({ title: '', content: '' });
      initialStateRef.current = { title: '', content: '' };
      setTitleHeight(60);
      setContentHeight(200);

      // Refocus title
      contentInputRef.current?.blur();
      setTimeout(() => titleInputRef.current?.focus(), 100);

      success('Reset', 'Note cleared');
    }
    console.log('🔄 Note reset');
  }, [mode, noteData, success]);

  // ─────────────────────────────────────────────────────────────
  // 1️⃣1️⃣ DELETE NOTE
  // ─────────────────────────────────────────────────────────────
  const handleConfirmDelete = useCallback(async () => {
    if (mode === 'edit' && noteData?.id) {
      // ✅ EDIT MODE: Delete the existing note
      setShowDeleteDialog(false);
      setIsSaving(true);

      try {
        const success_delete = await deleteNote(noteData.id);
        if (success_delete) {
          console.log('✅ Note deleted:', noteData.id);
          success('Deleted', 'Note has been deleted');
          // Navigate back
          setTimeout(() => router.back(), 500);
        }
      } catch (error) {
        console.error('❌ Delete error:', error);
        showError('Error', 'Failed to delete note');
      } finally {
        setIsSaving(false);
      }
    } else {
      // ✅ CREATE MODE: Just clear the form and go back
      setShowDeleteDialog(false);
      setPostText({ title: '', content: '' });
      router.back();
      success('Cleared', 'Note cleared');
    }
  }, [mode, noteData, success, showError]);

  // ─────────────────────────────────────────────────────────────
  // 1️⃣2️⃣ DISCARD CHANGES
  // ─────────────────────────────────────────────────────────────
  const handleDiscard = useCallback(() => {
    if (!hasChanges) {
      router.back();
      return;
    }
    setShowDiscardDialog(true);
  }, [hasChanges]);

  const handleConfirmDiscard = useCallback(() => {
    setShowDiscardDialog(false);
    setPostText({ title: '', content: '' });
    router.back();
    console.log('↩️ Discarded');
  }, []);

  // ─────────────────────────────────────────────────────────────
  // 1️⃣3️⃣ DROPDOWN MENU COMPONENT
  // ─────────────────────────────────────────────────────────────
  const MenuButton = useMemo(
    () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-10" disabled={isSaving}>
            <Icon as={MoreHorizontalIcon} className="size-5" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-[160px]">
          {/* SAVE OPTION */}
          <DropdownMenuItem
            onPress={handleSaveNote}
            disabled={isSaving || !hasChanges}
            className="gap-2">
            <Text className={!hasChanges ? 'opacity-50' : ''}>Save</Text>
          </DropdownMenuItem>

          {/* RESET OPTION */}
          <DropdownMenuItem onPress={handleResetNote} disabled={!hasChanges} className="gap-2">
            <Text className={!hasChanges ? 'opacity-50' : ''}>Reset</Text>
          </DropdownMenuItem>

          {/* DELETE OPTION */}
          <DropdownMenuItem onPress={() => setShowDeleteDialog(true)} className="gap-2">
            <Text className="text-destructive">Delete</Text>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    [isSaving, hasChanges, handleSaveNote, handleResetNote]
  );

  // ─────────────────────────────────────────────────────────────
  // 1️⃣4️⃣ SCREEN OPTIONS (Navigation header)
  // ─────────────────────────────────────────────────────────────
  const screenOptions = useMemo(
    (): ScreenOptionsParams => ({
      title: displayTitle,
      leftIcon: ChevronLeftIcon,
      leftAction: handleDiscard,
      RigthComponent: MenuButton,
    }),
    [displayTitle, handleDiscard, MenuButton]
  );

  // ─────────────────────────────────────────────────────────────
  // 1️⃣5️⃣ MEMOIZED TEXTAREA SECTIONS (Prevent unnecessary re-renders!)
  // ─────────────────────────────────────────────────────────────
  const TitleSection = useMemo(
    () => (
      <View className="px-4">
        <Textarea
          ref={titleInputRef}
          value={postText.title}
          onChangeText={handleTitleChange}
          onKeyPress={handleTitleKeyPress}
          onContentSizeChange={handleTitleHeightChange}
          placeholder="Title"
          multiline={true}
          maxLength={100}
          editable={!isSaving}
          scrollEnabled={false}
          style={{ height: titleHeight, minHeight: 60 }}
          className="border-0 border-none bg-transparent p-0 font-poppins_bold text-4xl placeholder:text-muted-foreground/50"
        />
      </View>
    ),
    [postText.title, titleHeight, isSaving, handleTitleChange, handleTitleKeyPress, handleTitleHeightChange]
  );

  const ContentSection = useMemo(
    () => (
      <View className="flex flex-1 px-4">
        <Textarea
          ref={contentInputRef}
          value={postText.content}
          onChangeText={handleContentChange}
          onFocus={handleContentFocus}
          onContentSizeChange={handleContentHeightChange}
          placeholder="Write your thoughts..."
          multiline={true}
          editable={!isSaving}
          scrollEnabled={false}
          style={{ height: contentHeight, minHeight: 200 }}
          className="flex flex-1 border-0 border-none bg-transparent p-0 font-poppins_regular text-base placeholder:text-muted-foreground/50"
        />
      </View>
    ),
    [postText.content, contentHeight, isSaving, handleContentChange, handleContentFocus, handleContentHeightChange]
  );

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS(screenOptions)} />

      {/* ✅ KEYBOARD AVOIDANCE - Higher offset to keep text visible! */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 220 : 100}>
        <Wrapper edges={['left', 'right']} className="relative flex flex-1 flex-col bg-background">
          {/* ✅ SCROLLABLE CONTENT AREA */}
          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 8 }}
            scrollEnabled={true}
            className="flex-1">
            {/* SPACING FROM TOP */}
            <View className="h-5" />

            {/* TITLE INPUT SECTION */}
            {TitleSection}

            {/* SPACING BETWEEN TITLE AND CONTENT */}
            <View className="h-6" />

            {/* CONTENT INPUT SECTION */}
            {ContentSection}

            {/* SPACING BEFORE FOOTER */}
            <View className="h-3" />
          </ScrollView>

          {/* ✅ STICKY FOOTER - Character counter stays at bottom, scrolls content above it */}
          <View className="border-t border-border/30 bg-background px-4 py-2">
            <View className="flex-row justify-between gap-2">
              <Text className="text-xs text-muted-foreground/60">
                {postText.content.length} chars
              </Text>
              <Text className="text-xs text-muted-foreground/60">{postText.title.length}/100</Text>
            </View>
          </View>
        </Wrapper>
      </KeyboardAvoidingView>

      {/* ✅ DISCARD CONFIRMATION */}
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>Are you sure? Your unsaved note will be lost. </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Text>Keep</Text>
            </AlertDialogCancel>
            <AlertDialogAction onPress={handleConfirmDiscard}>
              <Text>Discard</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ✅ DELETE CONFIRMATION */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete note?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Text>Cancel</Text>
            </AlertDialogCancel>
            <AlertDialogAction onPress={handleConfirmDelete}>
              <Text className="text-destructive">Delete</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
