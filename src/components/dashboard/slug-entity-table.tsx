"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import { PageHeader } from "@/components/dashboard/page-header";
import { ConfirmDeleteDialog } from "@/components/dashboard/confirm-delete-dialog";
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
  /** i18n namespace with keys: created, updated, deleted (e.g. "actions.categories") */
  toastNamespace: "actions.categories" | "actions.tags";
};

export function SlugEntityTable({
  rows,
  entity,
  entityPlural,
  subtitle,
  slugMaxLen,
  saveAction,
  deleteAction,
  toastNamespace,
}: Props) {
  const tSlug = useTranslations("dashboard.forms.slugEntity");
  const [editing, setEditing] = useState<
    { mode: "new" } | { mode: "edit"; row: SlugRow } | null
  >(null);
  const [confirmDelete, setConfirmDelete] = useState<SlugRow | null>(null);

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8">
      <PageHeader
        title={entityPlural}
        description={subtitle}
        action={
          <Button onClick={() => setEditing({ mode: "new" })}>
            <Plus className="me-1 size-4" /> {tSlug("newButton")}
          </Button>
        }
      />

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tSlug("colName")}</TableHead>
              <TableHead className="hidden md:table-cell">{tSlug("colSlug")}</TableHead>
              <TableHead className="text-end">{tSlug("colPosts")}</TableHead>
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
                  {tSlug("empty", { entityPlural })}
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
                        aria-label={tSlug("editAria", { name: r.name })}
                        title={tSlug("editAria", { name: r.name })}
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
                                aria-label={tSlug("deleteInUseAria", { name: r.name })}
                                className="opacity-50"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {tSlug("inUseTooltip", { count: r.postCount })}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setConfirmDelete(r)}
                          aria-label={tSlug("deleteAria", { name: r.name })}
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
        toastNamespace={toastNamespace}
        onOpenChange={(open) => !open && setEditing(null)}
      />

      <DeleteDialog
        row={confirmDelete}
        entity={entity}
        deleteAction={deleteAction}
        toastNamespace={toastNamespace}
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
  toastNamespace,
  onOpenChange,
}: {
  editing: { mode: "new" } | { mode: "edit"; row: SlugRow } | null;
  entity: string;
  slugMaxLen: number;
  saveAction: Action;
  toastNamespace: "actions.categories" | "actions.tags";
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
      toastNamespace={toastNamespace}
      onOpenChange={onOpenChange}
    />
  );
}

function EditForm({
  row,
  entity,
  slugMaxLen,
  saveAction,
  toastNamespace,
  onOpenChange,
}: {
  row: SlugRow | null;
  entity: string;
  slugMaxLen: number;
  saveAction: Action;
  toastNamespace: "actions.categories" | "actions.tags";
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const t = useTranslations(toastNamespace);
  const tSlug = useTranslations("dashboard.forms.slugEntity");
  const tCommon = useTranslations("dashboard.forms.common");
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
              ? tSlug("editTitle", { entity })
              : tSlug("newTitle", { entity })}
          </DialogTitle>
          <DialogDescription>{tSlug("description")}</DialogDescription>
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
              toast.success(isEdit ? t("updated") : t("created"));
              onOpenChange(false);
              router.refresh();
            });
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="slug-entity-name">{tCommon("name")}</Label>
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
            <Label htmlFor="slug-entity-slug">{tCommon("slug")}</Label>
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
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending
                ? tCommon("saving")
                : isEdit
                  ? tCommon("save")
                  : tSlug("create")}
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
  toastNamespace,
  onOpenChange,
}: {
  row: SlugRow | null;
  entity: string;
  deleteAction: Action;
  toastNamespace: "actions.categories" | "actions.tags";
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const t = useTranslations(toastNamespace);
  const tSlug = useTranslations("dashboard.forms.slugEntity");
  const [pending, startTransition] = useTransition();
  if (!row) return null;
  return (
    <ConfirmDeleteDialog
      open
      onOpenChange={onOpenChange}
      title={<>Delete &quot;{row.name}&quot;?</>}
      description={
        row.postCount > 0
          ? tSlug("deleteInUse", { count: row.postCount, entity })
          : tSlug("deleteNoUse")
      }
      pending={pending}
      disabled={row.postCount > 0}
      destructive
      onConfirm={() => {
        const fd = new FormData();
        fd.set("id", row.id);
        startTransition(async () => {
          const res = await deleteAction(null, fd);
          if (res?.error) {
            toast.error(res.error);
            return;
          }
          toast.success(t("deleted"));
          onOpenChange(false);
          router.refresh();
        });
      }}
    />
  );
}
