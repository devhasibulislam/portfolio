"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
  CountedTextarea,
  Field,
  FieldGrid,
  OptionalMark,
  Section,
  SwitchRow,
} from "@/components/dashboard/field-helpers";
import { PageHeader } from "@/components/dashboard/page-header";
import { ConfirmDeleteDialog } from "@/components/dashboard/confirm-delete-dialog";
import { TiptapEditor } from "@/components/dashboard/tiptap-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { slugify } from "@/lib/slug";
import { toDateInputValue } from "@/lib/dates";
import type {
  ExperienceFull,
  ExperienceRow,
} from "@/lib/db/queries/experience";
import {
  deleteExperience,
  saveExperience,
} from "@/app/dashboard/experience/actions";

const WORK_TYPES: { value: "on_site" | "remote" | "hybrid"; label: string }[] =
  [
    { value: "on_site", label: "On-site" },
    { value: "remote", label: "Remote" },
    { value: "hybrid", label: "Hybrid" },
  ];

type EditingState =
  | { mode: "new" }
  | { mode: "edit"; row: ExperienceRow; full: ExperienceFull }
  | null;

/**
 * Table + inline dialog form for experience. Table groups implicitly by
 * companySlug via the DB query ordering — visually, roles at the same
 * company sit together (most recent first).
 */
export function ExperienceManager({
  rows,
  mediaOptions,
  resolveFull,
}: {
  rows: ExperienceRow[];
  mediaOptions: MediaOption[];
  resolveFull: (id: string) => Promise<ExperienceFull | null>;
}) {
  const t = useTranslations("actions.experience");
  const tPage = useTranslations("dashboard.pages.experience");
  const [editing, setEditing] = useState<EditingState>(null);
  const [confirmDelete, setConfirmDelete] = useState<ExperienceRow | null>(
    null,
  );
  const [fetching, startFetch] = useTransition();
  const save = useAction(saveExperience);
  const del = useAction(deleteExperience);
  const pending = fetching || save.pending || del.pending;
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const onEdit = (row: ExperienceRow) => {
    setLoadingId(row.id);
    startFetch(async () => {
      const full = await resolveFull(row.id);
      setLoadingId(null);
      if (!full) {
        toast.error(t("notFound"));
        return;
      }
      setEditing({ mode: "edit", row, full });
    });
  };

  const onSave = (fd: FormData) =>
    save.run(fd, {
      successToast: editing?.mode === "edit" ? t("updated") : t("added"),
      onOk: () => setEditing(null),
    });

  const onDelete = (row: ExperienceRow) => {
    const fd = new FormData();
    fd.set("id", row.id);
    del.run(fd, {
      successToast: t("deleted", { role: row.role, company: row.company }),
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
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead className="w-48">Company</TableHead>
                <TableHead className="w-40">Period</TableHead>
                <TableHead className="w-28">Status</TableHead>
                <TableHead className="w-24 text-end">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
                    {r.role}
                    <div className="text-muted-foreground text-xs">
                      {r.slug}
                    </div>
                  </TableCell>
                  <TableCell>
                    {r.company}
                    {r.location ? (
                      <div className="text-muted-foreground text-xs">
                        {r.location}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatPeriod(r.periodStart, r.periodEnd)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        r.status === "published"
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
                      onClick={() => onEdit(r)}
                      disabled={pending && loadingId === r.id}
                      aria-label={`Edit ${r.role} at ${r.company}`}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setConfirmDelete(r)}
                      aria-label={`Delete ${r.role} at ${r.company}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ExperienceDialog
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
          <>
            {confirmDelete?.role} at {confirmDelete?.company} will be
            permanently removed.
          </>
        }
        pending={pending}
        onConfirm={() => confirmDelete && onDelete(confirmDelete)}
      />
    </div>
  );
}

// ---------- helpers ------------------------------------------------------

function formatPeriod(start: Date, end: Date | null): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
  const s = fmt(typeof start === "string" ? new Date(start) : start);
  const e = end
    ? fmt(typeof end === "string" ? new Date(end) : end)
    : "Present";
  return `${s} to ${e}`;
}

function ExperienceDialog({
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
  const full = editing?.mode === "edit" ? editing.full : null;
  // Keying the inner form on the target id remounts it with fresh state
  // when we swap targets — same pattern as ProjectDialog.
  const formKey = full?.id ?? "new";

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="max-w-2xl">
        {open ? (
          <ExperienceDialogForm
            key={formKey}
            full={full}
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

function ExperienceDialogForm({
  full,
  mediaOptions,
  onClose,
  onSave,
  pending,
}: {
  full: ExperienceFull | null;
  mediaOptions: MediaOption[];
  onClose: () => void;
  onSave: (fd: FormData) => void;
  pending: boolean;
}) {
  const tPage = useTranslations("dashboard.pages.experience");
  const [company, setCompany] = useState(full?.company ?? "");
  const [companySlug, setCompanySlug] = useState(full?.companySlug ?? "");
  const [companySlugDirty, setCompanySlugDirty] = useState(false);

  const [role, setRole] = useState(full?.role ?? "");
  const [slug, setSlug] = useState(full?.slug ?? "");
  const [slugDirty, setSlugDirty] = useState(false);

  const [logoId, setLogoId] = useState<string | null>(
    full?.companyLogoId ?? null,
  );

  const [highlights, setHighlights] = useState<unknown>(
    full?.highlights ?? { type: "doc", content: [] },
  );

  // Auto-derive slug = {company-slug}-{role-slug} until the author edits it.
  const derivedSlug =
    companySlug && role ? `${companySlug}-${slugify(role)}` : "";

  return (
    <form
      action={(fd) => {
        if (full) fd.set("id", full.id);
        if (logoId) fd.set("companyLogoId", logoId);
        fd.set(
          "highlights",
          JSON.stringify(highlights ?? { type: "doc", content: [] }),
        );
        onSave(fd);
      }}
    >
      <DialogHeader>
        <DialogTitle>
          {full ? tPage("editDialogEdit") : tPage("editDialogNew")}
        </DialogTitle>
        <DialogDescription>
          One row per role. A promotion at the same company shares a company
          slug so the public page groups them.
        </DialogDescription>
      </DialogHeader>

      <div className="mt-4 flex flex-col gap-6">
        {/* Company */}
        <Section title="Company">
          <FieldGrid>
            <Field htmlFor="company" label="Name" required>
              <CountedInput
                id="company"
                name="company"
                required
                max={120}
                value={company}
                onChange={(e) => {
                  setCompany(e.target.value);
                  if (!companySlugDirty) {
                    setCompanySlug(slugify(e.target.value));
                  }
                }}
              />
            </Field>
            <Field
              htmlFor="companySlug"
              label="Company slug"
              required
              hint="Groups roles at the same company."
            >
              <CountedInput
                id="companySlug"
                name="companySlug"
                required
                max={130}
                value={companySlug}
                onChange={(e) => {
                  setCompanySlug(e.target.value);
                  setCompanySlugDirty(true);
                }}
              />
            </Field>
            <Field htmlFor="location" label="Location" optional>
              <CountedInput
                id="location"
                name="location"
                max={100}
                defaultValue={full?.location ?? ""}
              />
            </Field>
            <Field htmlFor="workType" label="Work type" optional>
              <Select name="workType" defaultValue={full?.workType ?? "none"}>
                <SelectTrigger id="workType">
                  <SelectValue placeholder="Choose one" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {WORK_TYPES.map((w) => (
                    <SelectItem key={w.value} value={w.value}>
                      {w.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field
              className="col-span-2"
              htmlFor="companyUrl"
              label="Company URL"
              optional
            >
              <Input
                id="companyUrl"
                name="companyUrl"
                type="url"
                defaultValue={full?.companyUrl ?? ""}
              />
            </Field>
            <div className="col-span-2">
              <Label>
                Company logo
                <OptionalMark />
              </Label>
              <p className="text-muted-foreground mt-1 text-xs">
                Square 1:1 (ideally 512×512+). Up to 5 MB.
              </p>
              <div className="mt-1.5">
                <MediaPicker
                  options={mediaOptions}
                  value={logoId}
                  onChange={setLogoId}
                  aspect={1}
                  label="Pick or upload logo"
                />
              </div>
            </div>
          </FieldGrid>
        </Section>

        {/* Role */}
        <Section title="Role">
          <FieldGrid>
            <Field htmlFor="role" label="Title" required>
              <CountedInput
                id="role"
                name="role"
                required
                max={120}
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  if (!slugDirty && companySlug) {
                    setSlug(`${companySlug}-${slugify(e.target.value)}`);
                  }
                }}
              />
            </Field>
            <Field htmlFor="slug" label="URL slug" required>
              <CountedInput
                id="slug"
                name="slug"
                required
                max={200}
                value={slug || derivedSlug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugDirty(true);
                }}
              />
            </Field>
            <Field htmlFor="periodStart" label="Start date" required>
              <Input
                id="periodStart"
                name="periodStart"
                type="date"
                required
                defaultValue={toDateInputValue(full?.periodStart ?? null)}
              />
            </Field>
            <Field
              htmlFor="periodEnd"
              label="End date"
              optional
              hint="Leave blank if still there."
            >
              <Input
                id="periodEnd"
                name="periodEnd"
                type="date"
                defaultValue={toDateInputValue(full?.periodEnd ?? null)}
              />
            </Field>
            <Field
              className="col-span-2"
              htmlFor="summary"
              label="Summary"
              required
              hint="≤ 240 chars. Doubles as meta description fallback."
            >
              <CountedTextarea
                id="summary"
                name="summary"
                required
                rows={2}
                max={240}
                publishMin={80}
                defaultValue={full?.summary ?? ""}
              />
            </Field>
            <Field
              className="col-span-2"
              label="Highlights"
              optional
              hint="Rich text: bullet lists, headings, links, code. Same editor as the blog."
            >
              <TiptapEditor
                value={highlights}
                onChange={setHighlights}
                mediaOptions={mediaOptions}
                variant="compact"
                stickyTopClass="top-0"
              />
            </Field>
          </FieldGrid>
        </Section>

        {/* SEO + publish */}
        <Section title="SEO / Publish">
          <FieldGrid>
            <Field
              className="col-span-2"
              htmlFor="metaTitle"
              label="Meta title"
              optional
            >
              <CountedInput
                id="metaTitle"
                name="metaTitle"
                max={70}
                defaultValue={full?.metaTitle ?? ""}
              />
            </Field>
            <Field
              className="col-span-2"
              htmlFor="metaDescription"
              label="Meta description"
              optional
            >
              <CountedTextarea
                id="metaDescription"
                name="metaDescription"
                max={160}
                publishMin={80}
                rows={2}
                defaultValue={full?.metaDescription ?? ""}
              />
            </Field>
            <Field htmlFor="displayOrder" label="Display order" required>
              <Input
                id="displayOrder"
                name="displayOrder"
                type="number"
                min={0}
                required
                defaultValue={full?.displayOrder ?? 0}
              />
            </Field>
            <Field htmlFor="status" label="Status" required>
              <Select
                name="status"
                defaultValue={full?.status ?? "draft"}
                required
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <SwitchRow
              name="noindex"
              label="Noindex"
              hint="Hide from search engines."
              defaultChecked={full?.noindex ?? false}
            />
          </FieldGrid>
        </Section>
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
          {pending ? "Saving…" : full ? "Save changes" : "Create role"}
        </Button>
      </DialogFooter>
    </form>
  );
}
