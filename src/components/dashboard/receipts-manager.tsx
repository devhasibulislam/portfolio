"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
import { PageHeader } from "@/components/dashboard/page-header";
import { ConfirmDeleteDialog } from "@/components/dashboard/confirm-delete-dialog";
import {
  CountedInput,
  CountedTextarea,
  RequiredMark,
} from "@/components/dashboard/field-helpers";
import type { ReceiptRow } from "@/lib/db/queries/receipts";
import type { ReceiptInput } from "@/schemas/receipt";
import {
  deleteReceipt,
  saveReceipt,
  toggleReceiptFeatured,
} from "@/app/dashboard/receipts/actions";
import { FeatureSwitch } from "@/components/dashboard/feature-switch";

type EditingState = { mode: "new" } | { mode: "edit"; row: ReceiptRow } | null;

const STATUS_OPTIONS: ReceiptInput["status"][] = ["active", "archived"];

export function ReceiptsManager({ rows }: { rows: ReceiptRow[] }) {
  const t = useTranslations("actions.receipts");
  const tPage = useTranslations("dashboard.pages.receipts");
  const tForm = useTranslations("dashboard.forms.receipts");
  const tStatus = useTranslations("dashboard.forms.receipts.statusLabels");
  const tCommon = useTranslations("dashboard.forms.common");
  const router = useRouter();
  const [editing, setEditing] = useState<EditingState>(null);
  const [confirmDelete, setConfirmDelete] = useState<ReceiptRow | null>(null);
  const save = useAction(saveReceipt);
  const del = useAction(deleteReceipt);
  const pending = save.pending || del.pending;

  const onSave = (fd: FormData) =>
    save.run(fd, {
      successToast: editing?.mode === "edit" ? t("updated") : t("added"),
      onOk: () => setEditing(null),
    });

  const onDelete = (row: ReceiptRow) => {
    const fd = new FormData();
    fd.set("id", row.id);
    del.run(fd, {
      successToast: t("deleted", { title: row.title }),
      onOk: () => setConfirmDelete(null),
    });
  };

  const activeCount = rows.filter((r) => r.status === "active").length;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <PageHeader
        title={tPage("title")}
        description={tPage("description", { active: activeCount })}
        action={
          <Button onClick={() => setEditing({ mode: "new" })}>
            <Plus className="me-1 size-4" />
            {tPage("newButton")}
          </Button>
        }
      />

      {rows.length === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center">
          <p className="text-muted-foreground text-sm">{tPage("empty")}</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">{tForm("displayOrder")}</TableHead>
                <TableHead>{tForm("kicker")}</TableHead>
                <TableHead>{tForm("title")}</TableHead>
                <TableHead className="w-28">{tForm("status")}</TableHead>
                <TableHead className="w-24">{tCommon("featured")}</TableHead>
                <TableHead className="w-24 text-end">
                  {tPage("actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow
                  key={r.id}
                  className="cursor-pointer"
                  onClick={() => setEditing({ mode: "edit", row: r })}
                >
                  <TableCell className="text-muted-foreground tabular-nums">
                    #{r.displayOrder}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[var(--color-accent)]">
                    {r.kicker}
                  </TableCell>
                  <TableCell className="font-medium">{r.title}</TableCell>
                  <TableCell>
                    <span
                      className={
                        r.status === "active"
                          ? "inline-flex items-center rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-xs"
                          : "text-muted-foreground inline-flex items-center rounded-full border px-2 py-0.5 text-xs"
                      }
                    >
                      {tStatus(r.status)}
                    </span>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <FeatureSwitch
                      id={r.id}
                      featured={r.featured}
                      action={toggleReceiptFeatured}
                      labels={{
                        feature: tCommon("feature"),
                        unfeature: tCommon("unfeature"),
                      }}
                      onDone={() => router.refresh()}
                    />
                  </TableCell>
                  <TableCell
                    className="text-end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setEditing({ mode: "edit", row: r })}
                      aria-label={tPage("editAria", { title: r.title })}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
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

      <Dialog
        open={editing !== null}
        onOpenChange={(v) => !v && setEditing(null)}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editing?.mode === "edit"
                ? tPage("editTitle")
                : tPage("newTitle")}
            </DialogTitle>
            <DialogDescription>{tPage("dialogDescription")}</DialogDescription>
          </DialogHeader>
          <form action={onSave} className="grid gap-4">
            {editing?.mode === "edit" ? (
              <input type="hidden" name="id" value={editing.row.id} />
            ) : null}

            <Field
              name="kicker"
              label={tForm("kicker")}
              hint={tForm("kickerHint")}
              defaultValue={editing?.mode === "edit" ? editing.row.kicker : ""}
              max={60}
              required
            />
            <Field
              name="title"
              label={tForm("title")}
              defaultValue={editing?.mode === "edit" ? editing.row.title : ""}
              max={120}
              required
            />

            <div className="grid gap-2">
              <Label htmlFor="body">
                {tForm("body")} <RequiredMark />
              </Label>
              <CountedTextarea
                id="body"
                name="body"
                rows={4}
                max={400}
                defaultValue={editing?.mode === "edit" ? editing.row.body : ""}
                required
              />
            </div>

            <Field
              name="ctaLabel"
              label={tForm("ctaLabel")}
              defaultValue={
                editing?.mode === "edit" ? editing.row.ctaLabel : ""
              }
              max={40}
              required
            />
            <div className="grid gap-2">
              <Label htmlFor="ctaHref">
                {tForm("ctaHref")} <RequiredMark />
              </Label>
              <Input
                id="ctaHref"
                name="ctaHref"
                type="url"
                placeholder="https://…"
                maxLength={2048}
                defaultValue={
                  editing?.mode === "edit" ? editing.row.ctaHref : ""
                }
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="displayOrder">
                  {tForm("displayOrder")} <RequiredMark />
                </Label>
                <Input
                  id="displayOrder"
                  name="displayOrder"
                  type="number"
                  min={0}
                  max={9999}
                  defaultValue={
                    editing?.mode === "edit"
                      ? editing.row.displayOrder
                      : (rows.length + 1) * 10
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">
                  {tForm("status")} <RequiredMark />
                </Label>
                <Select
                  name="status"
                  defaultValue={
                    editing?.mode === "edit" ? editing.row.status : "active"
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {tStatus(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {save.pending ? null : null}

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditing(null)}
                disabled={pending}
              >
                {tPage("cancel")}
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? tPage("saving") : tPage("save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={confirmDelete !== null}
        onOpenChange={(v) => !v && setConfirmDelete(null)}
        title={tPage("deleteTitle")}
        description={tPage("deleteConfirm", {
          title: confirmDelete?.title ?? "",
        })}
        pending={del.pending}
        destructive
        onConfirm={() => confirmDelete && onDelete(confirmDelete)}
      />
    </div>
  );
}

function Field({
  name,
  label,
  hint,
  required,
  max,
  ...rest
}: React.ComponentProps<typeof CountedInput> & {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>
        {label} {required ? <RequiredMark /> : null}
      </Label>
      <CountedInput
        id={name}
        name={name}
        required={required}
        max={max}
        {...rest}
      />
      {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
    </div>
  );
}
