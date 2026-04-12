/**
 * ✅ NOTE CARD COMPONENT
 *
 * Minimalist elegant card for displaying user notes.
 * Reuses shadcn-ui components (Card, Button, DropdownMenu, Text)
 *
 * Features:
 * - Title + short description (truncated)
 * - Created/Updated date display
 * - Tap to view/edit detail
 * - Dropdown menu: Edit, Delete
 * - Real-time updates via AsyncStorage
 */

import React, { useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/fragments/shadcn-ui/card';
import { cn } from '@/lib/utils';
import { Pressable, ViewProps } from 'react-native';
import { router } from 'expo-router';
import { Button } from '../../shadcn-ui/button';
import { Icon } from '../../shadcn-ui/icon';
import { Text } from '../../shadcn-ui/text';
import { MoreHorizontalIcon, TrashIcon } from 'lucide-react-native';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../shadcn-ui/dropdown-menu';
import { Note } from '@/lib/storage/notes-storage';
import { useToast } from '../../shadcn-ui/toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../shadcn-ui/alert-dialog';

type NoteCardProps = ViewProps & {
  className?: string;
  note: Note;
  index: number;
  onDelete?: (noteId: string) => Promise<void>;
};

/**
 * ✅ NOTE CARD
 * Displays a single note with title, preview, and actions
 */
export function NoteCard({ className, index, note, onDelete, ...props }: NoteCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const { success, error: showError } = useToast();

  // ─────────────────────────────────────────────────────────────
  // 1️⃣ FORMAT DATA
  // ─────────────────────────────────────────────────────────────

  /**
   * ✅ PREVIEW: Show first 100 chars of content
   * Truncate with ellipsis if longer
   */
  const contentPreview = useMemo(() => {
    if (!note.content) return 'No content';
    if (note.content.length > 100) {
      return note.content.substring(0, 100) + '...';
    }
    return note.content;
  }, [note.content]);

  /**
   * ✅ FORMAT DATE: Show relative time
   * "2 hours ago" instead of full timestamp
   */
  const formattedDate = useMemo(() => {
    const now = Date.now();
    const diffMs = now - note.updatedAt;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return new Date(note.updatedAt).toLocaleDateString();
  }, [note.updatedAt]);

  // ─────────────────────────────────────────────────────────────
  // 2️⃣ NAVIGATION: To edit detail
  // ─────────────────────────────────────────────────────────────

  /**
   * ✅ NAVIGATE TO NOTE DETAIL
   * Pass note ID for editing
   */
  const navigateToDetail = useCallback(() => {
    router.push({
      pathname: '/(drawer)/note-detail/[id]',
      params: { id: note.id },
    });
  }, [note.id]);

  // ─────────────────────────────────────────────────────────────
  // 3️⃣ DELETE HANDLER
  // ─────────────────────────────────────────────────────────────

  /**
   * ✅ DELETE NOTE
   * With confirmation dialog
   */
  const handleDeleteConfirm = useCallback(async () => {
    setShowDeleteDialog(false);
    setIsDeleting(true);

    try {
      if (onDelete) {
        await onDelete(note.id);
        success('Deleted', 'Note has been deleted');
        console.log('✅ Note deleted:', note.id);
      }
    } catch (error) {
      console.error('❌ Delete error:', error);
      showError('Error', 'Failed to delete note');
    } finally {
      setIsDeleting(false);
    }
  }, [note.id, onDelete, success, showError]);

  // ─────────────────────────────────────────────────────────────
  // 4️⃣ RENDER
  // ─────────────────────────────────────────────────────────────

  return (
    <>
      <Card
        className={cn(
          'w-full flex-1 flex-row items-stretch gap-0 rounded-xl p-0 transition-all duration-200',
          className
        )}
        {...props}>
        {/* ✅ MAIN CONTENT AREA - Tap to edit */}
        <Pressable
          onPress={navigateToDetail}
          key={`note-${note.id}`}
          className="flex-1 overflow-hidden">
          {/* ✅ HEADER: Title + Delete button */}
          <CardHeader className="relative w-full flex-row items-start justify-between rounded-none px-4 py-3">
            {/* Title - Bold, truncated */}
            <Text className="line-clamp-1 flex-1 font-poppins_semibold text-lg text-foreground">
              {note.title || 'Untitled'}
            </Text>

            {/* ✅ MORE ACTIONS MENU */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2 size-8"
                  disabled={isDeleting}
                  onPress={(e) => {
                    e.preventDefault();
                  }}>
                  <Icon as={MoreHorizontalIcon} className="size-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="min-w-[140px]">
                {/* EDIT OPTION */}
                <DropdownMenuItem onPress={navigateToDetail} className="gap-2">
                  <Text>Edit</Text>
                </DropdownMenuItem>

                {/* DELETE OPTION */}
                <DropdownMenuItem onPress={() => setShowDeleteDialog(true)} className="gap-2">
                  <Text className="text-destructive">Delete</Text>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>

          {/* ✅ CONTENT AREA: Preview + metadata */}
          <CardContent className="w-full gap-2 rounded-none px-4 py-0 pb-3">
            {/* Preview text */}
            <CardDescription
              variant="p"
              className={cn('line-clamp-2 text-xs leading-relaxed text-muted-foreground')}>
              {contentPreview}
            </CardDescription>

            {/* Date metadata */}
            <Text className="text-xs text-muted-foreground/60">{formattedDate}</Text>
          </CardContent>
        </Pressable>
      </Card>

      {/* ✅ DELETE CONFIRMATION DIALOG */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete note?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? "{note.title || 'Untitled'}" will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              <Text>Cancel</Text>
            </AlertDialogCancel>
            <AlertDialogAction onPress={handleDeleteConfirm} disabled={isDeleting}>
              <Text>Delete</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
