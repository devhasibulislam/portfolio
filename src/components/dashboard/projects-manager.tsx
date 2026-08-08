"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Pencil, Plus, Star, Trash2, X } from "lucide-react";
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
  const t = useTranslations("actions.projects");
  const tPage = useTranslations("dashboard.pages.projects");
  const tCats = useTranslations("projects.categories");
  const tCommon = useTranslations("dashboard.forms.common");
  const [editing, setEditing] = useState<EditingState>(null);
  const [confirmDelete, setConfirmDelete] = useState<ProjectRow | null>(null);
  const [fetching, startFetch] = useTransition();
  const save = useAction(saveProject);
  const del = useAction(deleteProject);
  const pending = fetching || save.pending || del.pending;
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const onEdit = (row: ProjectRow) => {
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
      successToast: editing?.mode === "edit" ? t("updated") : t("saved"),
      onOk: () => setEditing(null),
    });

  const onDelete = (row: ProjectRow) => {
    const fd = new FormData();
    fd.set("id", row.id);
    del.run(fd, {
      successToast: t("deleted", { title: row.title }),
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
                <TableHead>{tPage("colProject")}</TableHead>
                <TableHead className="w-40">{tPage("colCategory")}</TableHead>
                <TableHead className="w-24">{tPage("colOrder")}</TableHead>
                <TableHead className="w-28">{tPage("colStatus")}</TableHead>
                <TableHead className="w-24 text-end">{tPage("colActions")}</TableHead>
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
                  <TableCell>{tCats(r.category)}</TableCell>
                  <TableCell>{r.displayOrder}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        r.status === "published"
                          ? "bg-[var(--color-accent)]/15 text-[var(--color-accent-strong)]"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {r.status === "published" ? tCommon("published") : tCommon("draft")}
                    </span>
                  </TableCell>
                  <TableCell className="text-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(r)}
                      disabled={pending && loadingId === r.id}
                      aria-label={tPage("editAria", { title: r.title })}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setConfirmDelete(r)}
                      aria-label={tPage("deleteAria", { title: r.title })}
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
        title={tPage("deleteDialogTitle")}
        description={
          <>{tPage("deleteConfirm", { title: confirmDelete?.title ?? "" })}</>
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
  const tPage = useTranslations("dashboard.pages.projects");
  const tForm = useTranslations("dashboard.forms.project");
  const tCommon = useTranslations("dashboard.forms.common");
  const tCat = useTranslations("projects.categories");
  const tLinks = useTranslations("dashboard.forms.project.linkKinds");
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
        <DialogTitle>
          {full ? tPage("editDialogEdit") : tPage("editDialogNew")}
        </DialogTitle>
        <DialogDescription>{tForm("description")}</DialogDescription>
      </DialogHeader>

      <div className="mt-4 flex flex-col gap-6">
        {/* Basics */}
        <Section title={tForm("section.basics")}>
          <FieldGrid>
            <Field
              className="col-span-2"
              htmlFor="title"
              label={tForm("title")}
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
            <Field
              className="col-span-2"
              htmlFor="slug"
              label={tForm("slug")}
              required
            >
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
              label={tForm("tagline")}
              required
              hint={tForm("taglineHint")}
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
            <Field htmlFor="client" label={tForm("client")} optional>
              <CountedInput
                id="client"
                name="client"
                max={100}
                defaultValue={full?.client ?? ""}
              />
            </Field>
            <Field htmlFor="location" label={tForm("location")} optional>
              <CountedInput
                id="location"
                name="location"
                max={100}
                defaultValue={full?.location ?? ""}
              />
            </Field>
            <Field htmlFor="role" label={tForm("yourRole")} optional>
              <CountedInput
                id="role"
                name="role"
                max={100}
                defaultValue={full?.role ?? ""}
              />
            </Field>
            <Field htmlFor="category" label={tForm("category")} required>
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
                      {tCat(c.value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field htmlFor="periodStart" label={tForm("periodStart")} optional>
              <Input
                id="periodStart"
                name="periodStart"
                type="date"
                defaultValue={toDateInputValue(full?.periodStart ?? null)}
              />
            </Field>
            <Field
              htmlFor="periodEnd"
              label={tForm("periodEnd")}
              optional
              hint={tForm("periodEndHint")}
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
        <Section title={tForm("section.content")}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>
                {tForm("body")}
                <OptionalMark />
              </Label>
              <p className="text-muted-foreground text-xs">
                {tForm("bodyHint")}
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
                {tForm("outcome")}
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
                {tForm("coverImage")}
                <RequiredMark />
              </Label>
              <p className="text-muted-foreground text-xs">
                {tForm("coverHint")}
              </p>
              <MediaPicker
                options={mediaOptions}
                value={coverId}
                onChange={setCoverId}
                aspect={1200 / 630}
                label={tForm("coverPickerLabel")}
              />
            </div>
          </div>
        </Section>

        {/* Links */}
        <Section
          title={tForm("section.links")}
          action={
            <Button type="button" variant="outline" size="sm" onClick={addLink}>
              <Plus className="me-1 size-3.5" />
              {tForm("addLink")}
            </Button>
          }
        >
          {links.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {tPage("linksEmpty")}
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
                          {tLinks(k.value)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder={tForm("linkLabelPlaceholder")}
                    value={l.label}
                    maxLength={40}
                    onChange={(e) => updateLink(i, { label: e.target.value })}
                  />
                  <Input
                    placeholder={tForm("linkUrlPlaceholder")}
                    value={l.url}
                    onChange={(e) => updateLink(i, { url: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={tForm("removeLink")}
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
        <Section title={tForm("section.seo")}>
          <FieldGrid>
            <Field
              className="col-span-2"
              htmlFor="metaTitle"
              label={tForm("metaTitle")}
              optional
              hint={tForm("metaTitleHint")}
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
              label={tForm("metaDescription")}
              optional
              hint={tForm("metaDescriptionHint")}
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
            <Field
              htmlFor="displayOrder"
              label={tForm("displayOrder")}
              required
            >
              <Input
                id="displayOrder"
                name="displayOrder"
                type="number"
                min={0}
                required
                defaultValue={full?.displayOrder ?? 0}
              />
            </Field>
            <Field htmlFor="status" label={tForm("status")} required>
              <Select
                name="status"
                defaultValue={full?.status ?? "draft"}
                required
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{tForm("draft")}</SelectItem>
                  <SelectItem value="published">
                    {tForm("published")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <SwitchRow
              name="featured"
              label={tForm("featured")}
              hint={tForm("featuredHint")}
              defaultChecked={full?.featured ?? false}
            />
            <SwitchRow
              name="noindex"
              label={tForm("noindex")}
              hint={tForm("noindexHint")}
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
          {tCommon("cancel")}
        </Button>
        <Button type="submit" disabled={pending}>
          {pending
            ? tCommon("saving")
            : full
              ? tCommon("save")
              : tForm("createButton")}
        </Button>
      </DialogFooter>
    </form>
  );
}
