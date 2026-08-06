"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Star, Trash2, X } from "lucide-react";
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
  MediaPicker,
  type MediaOption,
} from "@/components/dashboard/media-picker";
import {
  CountedInput,
  CountedTextarea,
  Field,
  FieldGrid,
  OptionalMark,
  RequiredMark,
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
import type { ProjectFull, ProjectRow } from "@/lib/db/queries/projects";
import type { ProjectLinkInput } from "@/schemas/project";
import { deleteProject, saveProject } from "@/app/dashboard/projects/actions";

const CATEGORIES: {
  value: ProjectRow["category"];
  label: string;
}[] = [
  { value: "enterprise", label: "Enterprise / Client" },
  { value: "product", label: "Product" },
  { value: "open_source", label: "Open source" },
  { value: "nda", label: "Under NDA" },
];

const CATEGORY_LABEL: Record<ProjectRow["category"], string> =
  Object.fromEntries(CATEGORIES.map((c) => [c.value, c.label])) as Record<
    ProjectRow["category"],
    string
  >;

const LINK_KINDS: { value: ProjectLinkInput["kind"]; label: string }[] = [
  { value: "website", label: "Website" },
  { value: "case_study", label: "Case study" },
  { value: "github", label: "GitHub" },
  { value: "demo", label: "Demo" },
  { value: "app_store", label: "App Store" },
  { value: "play_store", label: "Play Store" },
  { value: "docs", label: "Docs" },
  { value: "video", label: "Video" },
];

type EditingState =
  { mode: "new" } | { mode: "edit"; row: ProjectRow; full: ProjectFull } | null;

/**
 * Table + inline dialog form for projects. Reuses the SkillsManager shape.
 * On edit, the row's full record (body + links) is loaded on demand from
 * the dashboard page via a server-provided `resolveFull` prop so we don't
 * refetch the whole list.
 */
export function ProjectsManager({
  rows,
  mediaOptions,
  resolveFull,
}: {
  rows: ProjectRow[];
  mediaOptions: MediaOption[];
  resolveFull: (id: string) => Promise<ProjectFull | null>;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<EditingState>(null);
  const [confirmDelete, setConfirmDelete] = useState<ProjectRow | null>(null);
  const [pending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const onEdit = (row: ProjectRow) => {
    setLoadingId(row.id);
    startTransition(async () => {
      const full = await resolveFull(row.id);
      setLoadingId(null);
      if (!full) {
        toast.error("Project not found");
        return;
      }
      setEditing({ mode: "edit", row, full });
    });
  };

  const onSave = (fd: FormData) => {
    startTransition(async () => {
      const res = await saveProject(null, fd);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success(
        editing?.mode === "edit" ? "Project updated" : "Project created",
      );
      setEditing(null);
      router.refresh();
    });
  };

  const onDelete = (row: ProjectRow) => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", row.id);
      const res = await deleteProject(null, fd);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`Deleted "${row.title}"`);
      setConfirmDelete(null);
      router.refresh();
    });
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <PageHeader
        title="Projects"
        description="Client engagements, products, and open-source references. Featured projects surface first on the public page."
        action={
          <Button onClick={() => setEditing({ mode: "new" })}>
            <Plus className="me-1 size-4" />
            New project
          </Button>
        }
      />

      {rows.length === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center">
          <p className="text-muted-foreground text-sm">
            No projects yet. Click{" "}
            <span className="text-foreground font-medium">New project</span> to
            add your first one.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead className="w-40">Category</TableHead>
                <TableHead className="w-24">Order</TableHead>
                <TableHead className="w-28">Status</TableHead>
                <TableHead className="w-24 text-end">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      {r.title}
                      {r.featured ? (
                        <Star className="size-3 fill-current text-amber-500" />
                      ) : null}
                    </span>
                    <div className="text-muted-foreground text-xs">
                      {r.client ? `${r.client} · ` : ""}
                      {r.slug}
                    </div>
                  </TableCell>
                  <TableCell>{CATEGORY_LABEL[r.category]}</TableCell>
                  <TableCell>{r.displayOrder}</TableCell>
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
                      aria-label={`Edit ${r.title}`}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setConfirmDelete(r)}
                      aria-label={`Delete ${r.title}`}
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

      <ProjectDialog
        editing={editing}
        mediaOptions={mediaOptions}
        onClose={() => setEditing(null)}
        onSave={onSave}
        pending={pending}
      />

      <ConfirmDeleteDialog
        open={confirmDelete !== null}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        title="Delete project?"
        description={
          <>
            &quot;{confirmDelete?.title}&quot; will be permanently removed.
            Cached public pages get busted automatically.
          </>
        }
        pending={pending}
        onConfirm={() => confirmDelete && onDelete(confirmDelete)}
      />
    </div>
  );
}

function ProjectDialog({
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
  // Key the inner form on the target id — that way React remounts (and
  // re-initialises state) whenever we open the dialog for a different row,
  // instead of chasing prop changes with useEffect(setState).
  const formKey = full?.id ?? "new";

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="max-w-3xl">
        {open ? (
          <ProjectDialogForm
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

function ProjectDialogForm({
  full,
  mediaOptions,
  onClose,
  onSave,
  pending,
}: {
  full: ProjectFull | null;
  mediaOptions: MediaOption[];
  onClose: () => void;
  onSave: (fd: FormData) => void;
  pending: boolean;
}) {
  const [title, setTitle] = useState(full?.title ?? "");
  const [slug, setSlug] = useState(full?.slug ?? "");
  const [slugDirty, setSlugDirty] = useState(false);
  const [coverId, setCoverId] = useState<string | null>(
    full?.coverMediaId ?? null,
  );
  const [body, setBody] = useState<unknown>(
    full?.body ?? { type: "doc", content: [] },
  );
  const [links, setLinks] = useState<ProjectLinkInput[]>(full?.links ?? []);

  const addLink = () =>
    setLinks((prev) => [...prev, { kind: "website", label: "", url: "" }]);
  const removeLink = (i: number) =>
    setLinks((prev) => prev.filter((_, idx) => idx !== i));
  const updateLink = (i: number, patch: Partial<ProjectLinkInput>) =>
    setLinks((prev) =>
      prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)),
    );

  return (
    <form
      action={(fd) => {
        if (full) fd.set("id", full.id);
        if (coverId) fd.set("coverMediaId", coverId);
        fd.set("body", JSON.stringify(body ?? { type: "doc", content: [] }));
        // Links are serialized via parallel arrays so FormData handles them.
        for (const l of links) {
          fd.append("linkKind", l.kind);
          fd.append("linkLabel", l.label);
          fd.append("linkUrl", l.url);
        }
        onSave(fd);
      }}
    >
      <DialogHeader>
        <DialogTitle>{full ? "Edit project" : "New project"}</DialogTitle>
        <DialogDescription>
          Set draft to save without publishing. Cover image required to publish.
        </DialogDescription>
      </DialogHeader>

      <div className="mt-4 flex flex-col gap-6">
        {/* Basics */}
        <Section title="Basics">
          <FieldGrid>
            <Field
              className="col-span-2"
              htmlFor="title"
              label="Title"
              required
            >
              <CountedInput
                id="title"
                name="title"
                required
                max={120}
                publishMin={8}
                defaultValue={full?.title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!slugDirty) setSlug(slugify(e.target.value));
                }}
              />
            </Field>
            <Field className="col-span-2" htmlFor="slug" label="Slug" required>
              <CountedInput
                id="slug"
                name="slug"
                required
                max={130}
                value={slug || (title ? slugify(title) : "")}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugDirty(true);
                }}
              />
            </Field>
            <Field
              className="col-span-2"
              htmlFor="tagline"
              label="Tagline"
              required
              hint="One-line summary. Doubles as meta description fallback."
            >
              <CountedInput
                id="tagline"
                name="tagline"
                required
                max={200}
                publishMin={40}
                defaultValue={full?.tagline}
              />
            </Field>
            <Field htmlFor="client" label="Client" optional>
              <CountedInput
                id="client"
                name="client"
                max={100}
                defaultValue={full?.client ?? ""}
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
            <Field htmlFor="role" label="Your role" optional>
              <CountedInput
                id="role"
                name="role"
                max={100}
                defaultValue={full?.role ?? ""}
              />
            </Field>
            <Field htmlFor="category" label="Category" required>
              <Select
                name="category"
                defaultValue={full?.category ?? "enterprise"}
                required
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field htmlFor="periodStart" label="Period start" optional>
              <Input
                id="periodStart"
                name="periodStart"
                type="date"
                defaultValue={toDateInputValue(full?.periodStart ?? null)}
              />
            </Field>
            <Field
              htmlFor="periodEnd"
              label="Period end"
              optional
              hint="Leave blank for ongoing"
            >
              <Input
                id="periodEnd"
                name="periodEnd"
                type="date"
                defaultValue={toDateInputValue(full?.periodEnd ?? null)}
              />
            </Field>
          </FieldGrid>
        </Section>

        {/* Content */}
        <Section title="Content">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>
                Body
                <OptionalMark />
              </Label>
              <p className="text-muted-foreground text-xs">
                Rich text: headings, lists, links, code, images. Same editor the
                blog.
              </p>
              <TiptapEditor
                value={body}
                onChange={setBody}
                mediaOptions={mediaOptions}
                variant="compact"
                stickyTopClass="top-0"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="outcome">
                Outcome
                <OptionalMark />
              </Label>
              <CountedTextarea
                id="outcome"
                name="outcome"
                rows={3}
                max={1000}
                defaultValue={full?.outcome ?? ""}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>
                Cover image
                <RequiredMark />
              </Label>
              <p className="text-muted-foreground text-xs">
                1.91:1 landscape (used for OG cards, ideally 1200×630). Up to 5
                MB. Required to publish.
              </p>
              <MediaPicker
                options={mediaOptions}
                value={coverId}
                onChange={setCoverId}
                aspect={1200 / 630}
                label="Pick or upload cover"
              />
            </div>
          </div>
        </Section>

        {/* Links */}
        <Section
          title="Links"
          action={
            <Button type="button" variant="outline" size="sm" onClick={addLink}>
              <Plus className="me-1 size-3.5" />
              Add link
            </Button>
          }
        >
          {links.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No links yet. Add website, case study, GitHub, or store links.
              Kind drives the icon automatically.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {links.map((l, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 rounded-md border p-2"
                >
                  <Select
                    value={l.kind}
                    onValueChange={(v) =>
                      updateLink(i, {
                        kind: v as ProjectLinkInput["kind"],
                      })
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LINK_KINDS.map((k) => (
                        <SelectItem key={k.value} value={k.value}>
                          {k.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Label"
                    value={l.label}
                    maxLength={40}
                    onChange={(e) => updateLink(i, { label: e.target.value })}
                  />
                  <Input
                    placeholder="https://…"
                    value={l.url}
                    onChange={(e) => updateLink(i, { url: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remove link"
                    onClick={() => removeLink(i)}
                  >
                    <X className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* SEO */}
        <Section title="SEO">
          <FieldGrid>
            <Field
              className="col-span-2"
              htmlFor="metaTitle"
              label="Meta title"
              optional
              hint="≤ 60 chars. Leave blank to fall back to project title."
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
              hint="≤ 160 chars. Leave blank to fall back to tagline."
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
              name="featured"
              label="Featured"
              hint="Surfaces first on the projects grid."
              defaultChecked={full?.featured ?? false}
            />
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
          {pending ? "Saving…" : full ? "Save changes" : "Create project"}
        </Button>
      </DialogFooter>
    </form>
  );
}
