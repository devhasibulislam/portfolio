"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * Shared delete confirmation dialog. Every dashboard entity (posts,
 * projects, experience, skills, categories/tags, media, resume) shows
 * the same shape: title + description + Cancel/Delete. Consumers pass
 * their own copy and `onConfirm` handler; the shell owns nothing else.
 *
 * `disabled` blocks the Delete button (e.g. media in use, category with
 * live posts) while still letting the dialog explain why via description.
 * `destructive` toggles the red action styling — some flows want it (media,
 * posts, resume), some don't (per-record deletes on managers).
 */
export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  pending,
  disabled = false,
  destructive = false,
  confirmLabel = "Delete",
  pendingLabel = "Deleting…",
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description: React.ReactNode;
  pending: boolean;
  disabled?: boolean;
  destructive?: boolean;
  confirmLabel?: string;
  pendingLabel?: string;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending || disabled}
            className={
              destructive
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : undefined
            }
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
          >
            {pending ? pendingLabel : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
