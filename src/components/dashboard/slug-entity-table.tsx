"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { slugify } from "@/lib/slug";

/**
 * Shared list + create/edit dialog + delete confirm for any {name, slug,
 * postCount} entity. Used by categories & tags — same UI, wired to different
 * server actions.
 */

export type SlugRow = {
  id: string;
  name: string;
  slug: string;
  postCount: number;
};

type Action = (
  prev: { error?: string; ok?: true } | null,
  fd: FormData,
) => Promise<{ error?: string; ok?: true } | null>;

type Props = {
  rows: SlugRow[];
  entity: string; // "Category"
  entityPlural: string; // "Categories"
  subtitle: string;
  slugMaxLen: number;
  saveAction: Action;
  deleteAction: Action;
};

export function SlugEntityTable({
  rows,
  entity,
  entityPlural,
  subtitle,
  slugMaxLen,
  saveAction,
  deleteAction,
}: Props) {
  const [editing, setEditing] = useState<
    { mode: "new" } | { mode: "edit"; row: SlugRow } | null
  >(null);
  const [confirmDelete, setConfirmDelete] = useState<SlugRow | null>(null);

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {entityPlural}
          </h1>
          <p className="text-muted-foreground text-sm">{subtitle}</p>
        </div>
        <Button onClick={() => setEditing({ mode: "new" })}>
          <Plus className="me-1 size-4" /> New
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Slug</TableHead>
              <TableHead className="text-end">Posts</TableHead>
              <TableHead className="w-1" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-muted-foreground py-8 text-center"
                >
                  No {entityPlural.toLowerCase()} yet. Click{" "}
                  <strong>New</strong>.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow
                  key={r.id}
                  className="cursor-pointer"
                  onClick={() => setEditing({ mode: "edit", row: r })}
                >
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="text-muted-foreground hidden font-mono text-xs md:table-cell">
                    {r.slug}
                  </TableCell>
                  <TableCell className="text-end tabular-nums">
                    {r.postCount}
                  </TableCell>
                  <TableCell
                    className="text-end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="inline-flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditing({ mode: "edit", row: r })}
                        aria-label={`Edit ${r.name}`}
                        title={`Edit ${r.name}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      {r.postCount > 0 ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {/* span wrapper so the tooltip still fires while the
                                button underneath is disabled */}
                            <span>
                              <Button
                                size="icon"
                                variant="ghost"
                                disabled
                                aria-label={`Delete ${r.name} (in use)`}
                                className="opacity-50"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            In use by {r.postCount} post
                            {r.postCount === 1 ? "" : "s"}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setConfirmDelete(r)}
                          aria-label={`Delete ${r.name}`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <EditDialog
        editing={editing}
        entity={entity}
        slugMaxLen={slugMaxLen}
        saveAction={saveAction}
        onOpenChange={(open) => !open && setEditing(null)}
      />

      <DeleteDialog
        row={confirmDelete}
        entity={entity}
        deleteAction={deleteAction}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
      />
    </div>
  );
}

/* --------------------------- edit / new dialog --------------------------- */

function EditDialog({
  editing,
  entity,
  slugMaxLen,
  saveAction,
  onOpenChange,
}: {
  editing: { mode: "new" } | { mode: "edit"; row: SlugRow } | null;
  entity: string;
  slugMaxLen: number;
  saveAction: Action;
  onOpenChange: (open: boolean) => void;
}) {
  if (!editing) return null;
  const key = editing.mode === "edit" ? editing.row.id : "new";
  return (
    <EditForm
      key={key}
      row={editing.mode === "edit" ? editing.row : null}
      entity={entity}
      slugMaxLen={slugMaxLen}
      saveAction={saveAction}
      onOpenChange={onOpenChange}
    />
  );
}

function EditForm({
  row,
  entity,
  slugMaxLen,
  saveAction,
  onOpenChange,
}: {
  row: SlugRow | null;
  entity: string;
  slugMaxLen: number;
  saveAction: Action;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const isEdit = !!row;
  const [name, setName] = useState(row?.name ?? "");
  const [slug, setSlug] = useState(row?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent
        onEscapeKeyDown={(e) => pending && e.preventDefault()}
        onInteractOutside={(e) => pending && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? `Edit ${entity.toLowerCase()}`
              : `New ${entity.toLowerCase()}`}
          </DialogTitle>
          <DialogDescription>
            Max 30 chars each. Slug is URL-safe.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          action={(fd) => {
            fd.set("name", name);
            fd.set("slug", slug || slugify(name));
            if (row) fd.set("id", row.id);
            startTransition(async () => {
              const res = await saveAction(null, fd);
              if (res?.error) {
                setError(res.error);
                return;
              }
              toast.success(`${entity} ${isEdit ? "updated" : "created"}`);
              onOpenChange(false);
              router.refresh();
            });
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="slug-entity-name">Name</Label>
            <Input
              id="slug-entity-name"
              value={name}
              autoFocus
              maxLength={30}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="slug-entity-slug">Slug</Label>
            <Input
              id="slug-entity-slug"
              value={slug}
              maxLength={slugMaxLen}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              required
              pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
              className="font-mono text-sm"
            />
          </div>

          {error ? (
            <p
              role="alert"
              className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : isEdit ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------- delete dialog ----------------------------- */

function DeleteDialog({
  row,
  entity,
  deleteAction,
  onOpenChange,
}: {
  row: SlugRow | null;
  entity: string;
  deleteAction: Action;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  if (!row) return null;
  return (
    <AlertDialog open onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &quot;{row.name}&quot;?</AlertDialogTitle>
          <AlertDialogDescription>
            {row.postCount > 0
              ? `Blocked: ${row.postCount} post${row.postCount === 1 ? "" : "s"} still use this ${entity.toLowerCase()}. Reassign them first.`
              : "This can't be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending || row.postCount > 0}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={(e) => {
              e.preventDefault();
              const fd = new FormData();
              fd.set("id", row.id);
              startTransition(async () => {
                const res = await deleteAction(null, fd);
                if (res?.error) {
                  toast.error(res.error);
                  return;
                }
                toast.success(`${entity} deleted`);
                onOpenChange(false);
                router.refresh();
              });
            }}
          >
            {pending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
