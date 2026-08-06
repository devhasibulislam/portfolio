"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAction } from "@/hooks/use-action";
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
  MediaPicker,
  type MediaOption,
} from "@/components/dashboard/media-picker";
import {
  CountedInput,
  OptionalMark,
  RequiredMark,
} from "@/components/dashboard/field-helpers";
import { PageHeader } from "@/components/dashboard/page-header";
import { ConfirmDeleteDialog } from "@/components/dashboard/confirm-delete-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { slugify } from "@/lib/slug";
import {
  SKILL_GROUPS,
  SKILL_GROUP_LABEL,
  SKILL_PROFICIENCY_LABEL,
} from "@/lib/skill-groups";
import type { SkillRow } from "@/lib/db/queries/skills";
import type { SkillInput } from "@/schemas/skill";
import { deleteSkill, saveSkill } from "@/app/dashboard/skills/actions";

const PROFICIENCY_OPTIONS: SkillInput["proficiency"][] = [
  "working",
  "proficient",
  "expert",
];

type EditingState = { mode: "new" } | { mode: "edit"; row: SkillRow } | null;

/**
 * Table + inline dialog form for skills. Mirrors the shape of
 * SlugEntityTable (used by categories/tags) but with the extra fields the
 * `skills` table carries. One page = full CRUD; no subroutes.
 */
export function SkillsManager({
  rows,
  mediaOptions,
}: {
  rows: SkillRow[];
  mediaOptions: MediaOption[];
}) {
  const t = useTranslations("actions.skills");
  const tPage = useTranslations("dashboard.pages.skills");
  const [editing, setEditing] = useState<EditingState>(null);
  const [confirmDelete, setConfirmDelete] = useState<SkillRow | null>(null);
  const save = useAction(saveSkill);
  const del = useAction(deleteSkill);
  const pending = save.pending || del.pending;

  const grouped = useMemo(() => {
    const map = new Map<SkillInput["group"], SkillRow[]>();
    for (const g of SKILL_GROUPS) map.set(g.value, []);
    for (const r of rows) map.get(r.group)?.push(r);
    return Array.from(map, ([group, items]) => ({ group, items })).filter(
      (b) => b.items.length > 0,
    );
  }, [rows]);

  const onSave = (fd: FormData) =>
    save.run(fd, {
      successToast: editing?.mode === "edit" ? t("updated") : t("added"),
      onOk: () => setEditing(null),
    });

  const onDelete = (row: SkillRow) => {
    const fd = new FormData();
    fd.set("id", row.id);
    del.run(fd, {
      successToast: t("deleted", { name: row.name }),
      onOk: () => setConfirmDelete(null),
    });
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <PageHeader
        title={tPage("title")}
        description={tPage("description")}
        action={
          <Button onClick={() => setEditing({ mode: "new" })}>
            <Plus className="me-1 size-4" />
            {tPage("newButton")}
          </Button>
        }
      />

      {rows.length === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center">
          <p className="text-muted-foreground text-sm">
            {tPage("empty", { newButton: tPage("newButton") })}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {grouped.map(({ group, items }) => (
            <section key={group}>
              <h2 className="text-muted-foreground mb-2 text-xs font-medium tracking-widest uppercase">
                {SKILL_GROUP_LABEL[group]}
              </h2>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="w-40">Proficiency</TableHead>
                      <TableHead className="w-20">Years</TableHead>
                      <TableHead className="w-24">Order</TableHead>
                      <TableHead className="w-24">Status</TableHead>
                      <TableHead className="w-24 text-end">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">
                          <span className="inline-flex items-center gap-1.5">
                            {r.name}
                            {r.isPrimary ? (
                              <Star className="size-3 fill-current text-amber-500" />
                            ) : null}
                          </span>
                          <div className="text-muted-foreground text-xs">
                            {r.slug}
                          </div>
                        </TableCell>
                        <TableCell>
                          {SKILL_PROFICIENCY_LABEL[r.proficiency]}
                        </TableCell>
                        <TableCell>{r.years ?? "-"}</TableCell>
                        <TableCell>{r.displayOrder}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              r.status === "active"
                                ? "bg-[var(--color-accent)]/15 text-[var(--color-accent-strong)]"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {r.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditing({ mode: "edit", row: r })}
                            aria-label={`Edit ${r.name}`}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setConfirmDelete(r)}
                            aria-label={`Delete ${r.name}`}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>
          ))}
        </div>
      )}

      <SkillDialog
        editing={editing}
        mediaOptions={mediaOptions}
        onClose={() => setEditing(null)}
        onSave={onSave}
        pending={pending}
      />

      <ConfirmDeleteDialog
        open={confirmDelete !== null}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        title={tPage("deleteDialogTitle")}
        description={
          <>&quot;{confirmDelete?.name}&quot; will be permanently removed.</>
        }
        pending={pending}
        onConfirm={() => confirmDelete && onDelete(confirmDelete)}
      />
    </div>
  );
}

function SkillDialog({
  editing,
  mediaOptions,
  onClose,
  onSave,
  pending,
}: {
  editing: EditingState;
  mediaOptions: MediaOption[];
  onClose: () => void;
  onSave: (fd: FormData) => void;
  pending: boolean;
}) {
  const open = editing !== null;
  const row = editing?.mode === "edit" ? editing.row : null;

  // Keyed inner form: React remounts state on target row change instead of
  // resyncing via useEffect (matches projects/experience managers).
  const dialogKey = `${editing?.mode ?? "closed"}-${row?.id ?? "new"}`;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="max-w-lg">
        {open ? (
          <SkillDialogBody
            key={dialogKey}
            row={row}
            mediaOptions={mediaOptions}
            onClose={onClose}
            onSave={onSave}
            pending={pending}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function SkillDialogBody({
  row,
  mediaOptions,
  onClose,
  onSave,
  pending,
}: {
  row: SkillRow | null;
  mediaOptions: MediaOption[];
  onClose: () => void;
  onSave: (fd: FormData) => void;
  pending: boolean;
}) {
  const tPage = useTranslations("dashboard.pages.skills");
  // Local state for auto-slug + icon picker. Initialised once per keyed
  // mount, so switching rows always re-reads defaults.
  const [name, setName] = useState(row?.name ?? "");
  const [slug, setSlug] = useState(row?.slug ?? "");
  const [slugDirty, setSlugDirty] = useState(false);
  const [iconId, setIconId] = useState<string | null>(row?.iconMediaId ?? null);

  return (
    <form
      action={(fd) => {
        if (row) fd.set("id", row.id);
        if (iconId) fd.set("iconMediaId", iconId);
        onSave(fd);
      }}
    >
      <DialogHeader>
        <DialogTitle>
          {row ? tPage("editDialogEdit") : tPage("editDialogNew")}
        </DialogTitle>
        <DialogDescription>
          Skills group by resume section on the public page.
        </DialogDescription>
      </DialogHeader>

      <div className="mt-4 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="name">
              Name
              <RequiredMark />
            </Label>
            <CountedInput
              id="name"
              name="name"
              required
              max={60}
              defaultValue={row?.name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugDirty) setSlug(slugify(e.target.value));
              }}
            />
          </div>

          <div className="col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="slug">
              Slug
              <RequiredMark />
            </Label>
            <CountedInput
              id="slug"
              name="slug"
              required
              max={70}
              value={slug || (name ? slugify(name) : "")}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugDirty(true);
              }}
            />
          </div>

          <div className="col-span-2 flex flex-col gap-1.5">
            <Label>
              Icon
              <OptionalMark />
            </Label>
            <p className="text-muted-foreground text-xs">
              Square 1:1 logo (SVG or PNG, ideally 256×256+). Up to 5 MB.
            </p>
            <MediaPicker
              options={mediaOptions}
              value={iconId}
              onChange={setIconId}
              aspect={1}
              label="Pick or upload icon"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="group">
              Group
              <RequiredMark />
            </Label>
            <Select
              name="group"
              defaultValue={row?.group ?? "backend"}
              required
            >
              <SelectTrigger id="group">
                <SelectValue placeholder="Group" />
              </SelectTrigger>
              <SelectContent>
                {SKILL_GROUPS.map((g) => (
                  <SelectItem key={g.value} value={g.value}>
                    {g.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="proficiency">
              Proficiency
              <RequiredMark />
            </Label>
            <Select
              name="proficiency"
              defaultValue={row?.proficiency ?? "proficient"}
              required
            >
              <SelectTrigger id="proficiency">
                <SelectValue placeholder="Proficiency" />
              </SelectTrigger>
              <SelectContent>
                {PROFICIENCY_OPTIONS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {SKILL_PROFICIENCY_LABEL[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="years">
              Years
              <OptionalMark />
            </Label>
            <Input
              id="years"
              name="years"
              type="number"
              min={0}
              max={60}
              step={1}
              defaultValue={row?.years ?? ""}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="displayOrder">
              Display order
              <RequiredMark />
            </Label>
            <Input
              id="displayOrder"
              name="displayOrder"
              type="number"
              min={0}
              step={1}
              required
              defaultValue={row?.displayOrder ?? 0}
            />
          </div>

          <div className="col-span-2 flex items-center justify-between rounded-md border p-3">
            <div>
              <Label htmlFor="isPrimary" className="cursor-pointer">
                Primary skill
              </Label>
              <p className="text-muted-foreground text-xs">
                Surfaces in hero/summary contexts.
              </p>
            </div>
            <Switch
              id="isPrimary"
              name="isPrimary"
              defaultChecked={row?.isPrimary ?? false}
            />
          </div>

          <div className="col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="status">
              Status
              <RequiredMark />
            </Label>
            <Select
              name="status"
              defaultValue={row?.status ?? "active"}
              required
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <DialogFooter className="mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={pending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : row ? "Save changes" : "Create skill"}
        </Button>
      </DialogFooter>
    </form>
  );
}
