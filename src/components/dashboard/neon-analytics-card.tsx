"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  AlertCircle,
  ArrowDownToLine,
  Cpu,
  Database,
  GitBranch,
  HardDrive,
  RefreshCw,
  Timer,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { NeonAnalytics } from "@/lib/neon-api";
import { refreshNeonAnalytics } from "@/app/dashboard/neon-actions";

/**
 * Neon analytics widget for the dashboard Overview. Reads a cached
 * aggregate (5-minute revalidation) and offers a manual refresh that
 * busts the tag via a server action.
 *
 * Free-tier friendly: never hits the Neon API on every render — the cache
 * boundary lives inside `getNeonAnalytics()` in `src/lib/neon-api.ts`.
 */
export function NeonAnalyticsCard({ data }: { data: NeonAnalytics }) {
  const router = useRouter();
  const t = useTranslations("dashboard");
  const [pending, startTransition] = useTransition();

  const onRefresh = () =>
    startTransition(async () => {
      await refreshNeonAnalytics();
      toast.success(t("neonRefreshed"));
      router.refresh();
    });

  if (!data.configured) {
    return (
      <Card className="border-dashed p-5">
        <div className="flex items-start gap-3">
          <Database className="text-muted-foreground mt-0.5 size-4" />
          <div>
            <h3 className="text-sm font-semibold">Neon analytics</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Set <code>NEON_API_KEY</code> and <code>NEON_PROJECT_ID</code> in{" "}
              <code>.env.local</code> to enable the live database stats widget.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (data.error) {
    return (
      <Card className="border-destructive/40 p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-destructive mt-0.5 size-4" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold">Neon analytics</h3>
            <p className="text-muted-foreground mt-1 text-sm break-all">
              {data.error}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={pending}
          >
            <RefreshCw
              className={`me-1 size-3.5 ${pending ? "animate-spin" : ""}`}
            />
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  const storagePct =
    data.storageLimitBytes > 0
      ? Math.min(100, (data.storageBytes / data.storageLimitBytes) * 100)
      : 0;

  // Neon Free tier headline limits (see https://neon.com/docs/introduction/plans):
  //   • 191.9 CU-hours of compute per month
  //   • 5 GB of egress ("data transfer") per month
  // Progress bars against these turn the widget into an actual bill-guard,
  // not just a set of numbers.
  const FREE_COMPUTE_SECONDS = 191.9 * 3600;
  const FREE_EGRESS_BYTES = 5 * 1024 * 1024 * 1024;
  const computePct = Math.min(
    100,
    (data.computeTimeSeconds / FREE_COMPUTE_SECONDS) * 100,
  );
  const egressPct = Math.min(
    100,
    (data.dataTransferBytes / FREE_EGRESS_BYTES) * 100,
  );

  return (
    <Card className="p-5">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Database className="size-4" />
            Neon · {data.projectName}
          </h3>
          <p className="text-muted-foreground mt-1 text-xs">
            {data.region} · Postgres {data.pgVersion}
            {data.periodStart
              ? ` · billing period from ${new Date(data.periodStart).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
              : null}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={pending}
          aria-label="Refresh Neon analytics"
        >
          <RefreshCw
            className={`me-1 size-3.5 ${pending ? "animate-spin" : ""}`}
          />
          {pending ? "Refreshing…" : "Refresh"}
        </Button>
      </header>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat
          icon={HardDrive}
          label="Storage"
          value={formatBytes(data.storageBytes)}
          hint={`of ${formatBytes(data.storageLimitBytes)}`}
          progress={storagePct}
        />
        <Stat
          icon={Cpu}
          label="Compute"
          value={formatDuration(data.computeTimeSeconds)}
          hint={`of ~192 CU-hr (Free)`}
          progress={computePct}
        />
        <Stat
          icon={ArrowDownToLine}
          label="Egress"
          value={formatBytes(data.dataTransferBytes)}
          hint={`of 5 GB (Free)`}
          progress={egressPct}
        />
        <Stat
          icon={Timer}
          label="Period ends"
          value={formatCountdown(data.periodEnd)}
          hint={
            data.periodEnd
              ? new Date(data.periodEnd).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })
              : "-"
          }
        />
      </div>

      <div className="text-muted-foreground mt-3 grid grid-cols-2 gap-4 text-xs md:grid-cols-4">
        <div>
          <span className="me-1">Active</span>
          <span className="text-foreground tabular-nums">
            {formatDuration(data.activeTimeSeconds)}
          </span>
        </div>
        <div>
          <span className="me-1">Writes</span>
          <span className="text-foreground tabular-nums">
            {formatBytes(data.writtenDataBytes)}
          </span>
        </div>
        <div>
          <span className="me-1">Branches</span>
          <span className="text-foreground tabular-nums">
            {data.branchCount}
          </span>
        </div>
        <div>
          <span className="me-1 inline-flex items-center gap-1">
            <GitBranch className="size-3" />
            Primary
          </span>
          <span className="text-foreground">{data.primaryBranch ?? "-"}</span>
        </div>
      </div>

      <footer className="text-muted-foreground mt-4 text-[11px]">
        Cached · updated {relativeTime(data.fetchedAt)}
        {data.suspendTimeoutSeconds === 0
          ? " · scales to zero when idle"
          : null}
        {data.autoscalingMaxCu != null
          ? ` · ${data.autoscalingMinCu} to ${data.autoscalingMaxCu} CU autoscale`
          : null}
      </footer>
    </Card>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
  progress,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
  progress?: number;
}) {
  return (
    <div>
      <div className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-medium tracking-wide uppercase">
        <Icon className="size-3" />
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold tabular-nums">{value}</div>
      {hint ? (
        <div className="text-muted-foreground mt-0.5 text-xs">{hint}</div>
      ) : null}
      {progress !== undefined ? (
        <div className="bg-muted mt-2 h-1 w-full overflow-hidden rounded-full">
          <div
            className={`h-full ${
              progress > 80
                ? "bg-destructive"
                : progress > 60
                  ? "bg-amber-500"
                  : "bg-[var(--color-accent)]"
            }`}
            style={{ inlineSize: `${progress}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}

// ---------- formatters ---------------------------------------------------

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const min = seconds / 60;
  if (min < 60) return `${min.toFixed(1)} min`;
  const hr = min / 60;
  return `${hr.toFixed(1)} hr`;
}

function formatCountdown(iso: string | null): string {
  if (!iso) return "-";
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "any time";
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}

function relativeTime(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  return `${Math.floor(s / 3600)} hr ago`;
}
