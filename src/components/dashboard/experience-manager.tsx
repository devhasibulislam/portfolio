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
  MediaPicker,
  type MediaOption,
} from "@/components/dashboard/media-picker";
import {
  CountedInput,
  CountedTextarea,
  OptionalMark,
  RequiredMark,
} from "@/components/dashboard/field-helpers";
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
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/slug";
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
  const router = useRouter();
  const [editing, setEditing] = useState<EditingState>(null);
  const [confirmDelete, setConfirmDelete] = useState<ExperienceRow | null>(
    null,
  );
  const [pending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const onEdit = (row: ExperienceRow) => {
    setLoadingId(row.id);
    startTransition(async () => {
      const full = await resolveFull(row.id);
      setLoadingId(null);
      if (!full) {
        toast.error("Experience not found");
        return;
      }
      setEditing({ mode: "edit", row, full });
    });
  };

  const onSave = (fd: FormData) => {
    startTransition(async () => {
      const res = await saveExperience(null, fd);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success(editing?.mode === "edit" ? "Role updated" : "Role added");
      setEditing(null);
      router.refresh();
    });
  };

  const onDelete = (row: ExperienceRow) => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", row.id);
      const res = await deleteExperience(null, fd);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`Deleted ${row.role} at ${row.company}`);
      setConfirmDelete(null);
      router.refresh();
    });
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Experience</h1>
          <p className="text-muted-foreground text-sm">
            One row per role. Promotions share a company slug and group on the
            public page.
          </p>
        </div>
        <Button onClick={() => setEditing({ mode: "new" })}>
          <Plus className="me-1 size-4" />
          New role
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center">
          <p className="text-muted-foreground text-sm">
            No roles yet. Click{" "}
            <span className="text-foreground font-medium">New role</span> to add
            your first one.
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

      <AlertDialog
        open={confirmDelete !== null}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete role?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDelete?.role} at {confirmDelete?.company} will be
              permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={() => confirmDelete && onDelete(confirmDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
  return `${s} — ${e}`;
}

function toDateInputValue(d: Date | string | null): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function bulletDocToText(doc: unknown): string {
  if (!doc || typeof doc !== "object") return "";
  const d = doc as { content?: Array<{ type: string; content?: unknown[] }> };
  const items: string[] = [];
  const walk = (nodes?: unknown[]) => {
    if (!nodes) return;
    for (const raw of nodes) {
      const n = raw as { type: string; content?: unknown[]; text?: string };
      if (n.type === "listItem") {
        // Flatten first paragraph's text.
        const p = n.content?.[0] as
          { content?: Array<{ type: string; text?: string }> } | undefined;
        const text = (p?.content ?? [])
          .map((c) => (c.type === "text" ? (c.text ?? "") : ""))
          .join("");
        if (text) items.push(text);
      } else if (n.content) {
        walk(n.content);
      }
    }
  };
  walk(d.content);
  return items.map((i) => `- ${i}`).join("\n");
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
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
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
  const [company, setCompany] = useState(full?.company ?? "");
  const [companySlug, setCompanySlug] = useState(full?.companySlug ?? "");
  const [companySlugDirty, setCompanySlugDirty] = useState(false);

  const [role, setRole] = useState(full?.role ?? "");
  const [slug, setSlug] = useState(full?.slug ?? "");
  const [slugDirty, setSlugDirty] = useState(false);

  const [logoId, setLogoId] = useState<string | null>(
    full?.companyLogoId ?? null,
  );

  // Auto-derive slug = {company-slug}-{role-slug} until the author edits it.
  const derivedSlug =
    companySlug && role ? `${companySlug}-${slugify(role)}` : "";

  return (
    <form
      action={(fd) => {
        if (full) fd.set("id", full.id);
        if (logoId) fd.set("companyLogoId", logoId);
        onSave(fd);
      }}
    >
      <DialogHeader>
        <DialogTitle>{full ? "Edit role" : "New role"}</DialogTitle>
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
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
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
              htmlFor="highlightsText"
              label="Highlights"
              optional
              hint="One bullet per line. Blank lines OK — leading dashes ignored."
            >
              <Textarea
                id="highlightsText"
                name="highlightsText"
                rows={8}
                placeholder={`- Cut hot-path list API p95 from ~200 ms to ~20 ms\n- Standardised multi-tenant isolation with Postgres RLS`}
                defaultValue={bulletDocToText(full?.highlights)}
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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-widest uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

function Field({
  htmlFor,
  label,
  hint,
  className,
  required,
  optional,
  children,
}: {
  htmlFor?: string;
  label: string;
  hint?: string;
  className?: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <Label htmlFor={htmlFor}>
        {label}
        {required ? <RequiredMark /> : null}
        {optional ? <OptionalMark /> : null}
      </Label>
      {children}
      {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
    </div>
  );
}

function SwitchRow({
  name,
  label,
  hint,
  defaultChecked,
}: {
  name: string;
  label: string;
  hint: string;
  defaultChecked: boolean;
}) {
  return (
    <div className="col-span-2 flex items-center justify-between rounded-md border p-3">
      <div>
        <Label htmlFor={name} className="cursor-pointer">
          {label}
        </Label>
        <p className="text-muted-foreground text-xs">{hint}</p>
      </div>
      <Switch id={name} name={name} defaultChecked={defaultChecked} />
    </div>
  );
}
