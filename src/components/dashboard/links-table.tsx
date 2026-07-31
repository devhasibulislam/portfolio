"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
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
import type { LinkRow } from "@/lib/db/queries/links";
import { deleteLink, saveLink } from "@/app/dashboard/links/actions";

type Editing = { mode: "new" } | { mode: "edit"; row: LinkRow } | null;

export function LinksTable({ rows }: { rows: LinkRow[] }) {
  const [editing, setEditing] = useState<Editing>(null);
  const [confirmDelete, setConfirmDelete] = useState<LinkRow | null>(null);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Links</h1>
          <p className="text-muted-foreground text-sm">
            Rows shown on the public <code>/links</code> page, in order.
          </p>
        </div>
        <Button onClick={() => setEditing({ mode: "new" })}>
          <Plus className="me-1 size-4" /> New
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>URL</TableHead>
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
                  No links yet. Click <strong>New</strong>.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow
                  key={r.id}
                  className="cursor-pointer"
                  onClick={() => setEditing({ mode: "edit", row: r })}
                >
                  <TableCell className="text-muted-foreground tabular-nums">
                    {r.sortOrder}
                  </TableCell>
                  <TableCell className="font-medium">{r.label}</TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate font-mono text-xs">
                    {r.url}
                  </TableCell>
                  <TableCell
                    className="text-end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button size="icon" variant="ghost" asChild>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${r.label}`}
                      >
                        <ExternalLink className="size-4" />
                      </a>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Delete ${r.label}`}
                      onClick={() => setConfirmDelete(r)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <EditDialog
        editing={editing}
        onOpenChange={(open) => !open && setEditing(null)}
      />
      <DeleteDialog
        row={confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
      />
    </div>
  );
}

/* ---------------------------- edit / new dialog --------------------------- */

function EditDialog({
  editing,
  onOpenChange,
}: {
  editing: Editing;
  onOpenChange: (open: boolean) => void;
}) {
  if (!editing) return null;
  const key = editing.mode === "edit" ? editing.row.id : "new";
  return (
    <EditForm
      key={key}
      row={editing.mode === "edit" ? editing.row : null}
      onOpenChange={onOpenChange}
    />
  );
}

function EditForm({
  row,
  onOpenChange,
}: {
  row: LinkRow | null;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const isEdit = !!row;
  const [label, setLabel] = useState(row?.label ?? "");
  const [url, setUrl] = useState(row?.url ?? "https://");
  const [sortOrder, setSortOrder] = useState(row?.sortOrder ?? 0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent
        onEscapeKeyDown={(e) => pending && e.preventDefault()}
        onInteractOutside={(e) => pending && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit link" : "New link"}</DialogTitle>
          <DialogDescription>
            Public rows on <code>/links</code>, sorted ascending by order.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          action={(fd) => {
            fd.set("label", label);
            fd.set("url", url);
            fd.set("sortOrder", String(sortOrder));
            if (row) fd.set("id", row.id);
            startTransition(async () => {
              const res = await saveLink(null, fd);
              if (res?.error) {
                setError(res.error);
                return;
              }
              toast.success(`Link ${isEdit ? "updated" : "created"}`);
              onOpenChange(false);
              router.refresh();
            });
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="link-label">Label</Label>
            <Input
              id="link-label"
              value={label}
              autoFocus
              maxLength={60}
              onChange={(e) => setLabel(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="link-url">URL</Label>
            <Input
              id="link-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="font-mono text-sm"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="link-order">Order</Label>
            <Input
              id="link-order"
              type="number"
              min={0}
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className="max-w-24"
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
  onOpenChange,
}: {
  row: LinkRow | null;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  if (!row) return null;
  return (
    <AlertDialog open onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{row.label}”?</AlertDialogTitle>
          <AlertDialogDescription>Can&rsquo;t be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={(e) => {
              e.preventDefault();
              const fd = new FormData();
              fd.set("id", row.id);
              startTransition(async () => {
                const res = await deleteLink(null, fd);
                if (res?.error) {
                  toast.error(res.error);
                  return;
                }
                toast.success("Link deleted");
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
