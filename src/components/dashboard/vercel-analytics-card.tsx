"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Gauge,
  GitCommit,
  Globe,
  RefreshCw,
  Rocket,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { VercelAnalytics, VercelDeployment } from "@/lib/vercel-api";
import { refreshVercelAnalytics } from "@/app/dashboard/vercel-actions";

/**
 * Vercel analytics widget for the dashboard Overview. Reads a cached
 * aggregate (5-minute revalidation) and offers a manual refresh that
 * busts the tag via a server action.
 *
 * Mirrors `NeonAnalyticsCard`: same shell, same refresh contract, same
 * error/not-configured states.
 */
export function VercelAnalyticsCard({ data }: { data: VercelAnalytics }) {
  const router = useRouter();
  const t = useTranslations("dashboard");
  const tV = useTranslations("dashboard.vercel");
  const [pending, startTransition] = useTransition();

  const onRefresh = () =>
    startTransition(async () => {
      await refreshVercelAnalytics();
      toast.success(t("vercelRefreshed"));
      router.refresh();
    });

  if (!data.configured) {
    return (
      <Card className="border-dashed p-5">
        <div className="flex items-start gap-3">
          <Rocket className="text-muted-foreground mt-0.5 size-4" />
          <div>
            <h3 className="text-sm font-semibold">{tV("title")}</h3>
            <p
              className="text-muted-foreground mt-1 text-sm"
              dangerouslySetInnerHTML={{ __html: tV("notConfigured") }}
            />
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
            <h3 className="text-sm font-semibold">{tV("title")}</h3>
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
            {tV("retry")}
          </Button>
        </div>
      </Card>
    );
  }

  const latest = data.latestDeployment;

  return (
    <Card className="p-5">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Rocket className="size-4" />
            Vercel · {data.projectName}
          </h3>
          <p className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 text-xs">
            {data.framework ? <span>{data.framework}</span> : null}
            {data.nodeVersion ? <span>· Node {data.nodeVersion}</span> : null}
            {data.productionUrl ? (
              <a
                href={
                  data.productionUrl.startsWith("http")
                    ? data.productionUrl
                    : `https://${data.productionUrl}`
                }
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground inline-flex items-center gap-1 underline-offset-2 hover:underline"
              >
                <Globe className="size-3" />
                {data.productionUrl.replace(/^https?:\/\//, "")}
                <ExternalLink className="size-3" />
              </a>
            ) : null}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={pending}
          aria-label={tV("refreshAria")}
        >
          <RefreshCw
            className={`me-1 size-3.5 ${pending ? "animate-spin" : ""}`}
          />
          {pending ? tV("refreshing") : tV("refresh")}
        </Button>
      </header>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat
          icon={CheckCircle2}
          label={tV("deploysReady")}
          value={data.deployCounts.ready.toString()}
          hint={tV("last10")}
          accent="ok"
        />
        <Stat
          icon={XCircle}
          label={tV("deploysError")}
          value={(
            data.deployCounts.error + data.deployCounts.building
          ).toString()}
          hint={
            data.deployCounts.building > 0
              ? tV("nBuilding", { n: data.deployCounts.building })
              : tV("last10")
          }
          accent={data.deployCounts.error > 0 ? "bad" : "muted"}
        />
        <Stat
          icon={Gauge}
          label={tV("speedInsights")}
          value={
            data.speedInsightsHasData
              ? tV("collecting")
              : data.speedInsightsEnabled
                ? tV("enabled")
                : tV("off")
          }
          hint={tV("coreWebVitals")}
          accent={data.speedInsightsHasData ? "ok" : "muted"}
        />
        <Stat
          icon={Globe}
          label={tV("webAnalytics")}
          value={data.webAnalyticsEnabled ? tV("enabled") : tV("off")}
          hint={tV("visitorsPageviews")}
          accent={data.webAnalyticsEnabled ? "ok" : "muted"}
        />
      </div>

      {latest ? (
        <div className="mt-4">
          <div className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
            {tV("latestDeployment")}
          </div>
          <DeploymentRow d={latest} />
        </div>
      ) : null}

      {data.recentDeployments.length > 1 ? (
        <details className="group mt-3">
          <summary className="text-muted-foreground hover:text-foreground cursor-pointer text-xs">
            {tV("recentDeployments", {
              n: Math.min(data.recentDeployments.length, 9),
            })}
          </summary>
          <ul className="mt-2 flex flex-col gap-1">
            {data.recentDeployments.slice(1).map((d) => (
              <li key={d.id}>
                <DeploymentRow d={d} compact />
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      <footer className="text-muted-foreground mt-4 text-[11px]">
        {tV("cachedUpdated", { when: relativeTime(data.fetchedAt) })}
        {data.domains.length > 0
          ? ` · ${tV("nDomains", { n: data.domains.length })}`
          : null}
      </footer>
    </Card>
  );
}

function DeploymentRow({
  d,
  compact,
}: {
  d: VercelDeployment;
  compact?: boolean;
}) {
  const stateColor =
    d.state === "READY"
      ? "text-emerald-600 dark:text-emerald-400"
      : d.state === "ERROR" || d.state === "CANCELED"
        ? "text-destructive"
        : "text-amber-600 dark:text-amber-400";
  return (
    <a
      href={`https://${d.url}`}
      target="_blank"
      rel="noreferrer"
      className="hover:bg-muted/40 mt-1 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
    >
      <span
        className={`inline-block size-2 rounded-full ${
          d.state === "READY"
            ? "bg-emerald-500"
            : d.state === "ERROR" || d.state === "CANCELED"
              ? "bg-red-500"
              : "bg-amber-500"
        }`}
        aria-hidden
      />
      <span className={`text-xs font-medium tabular-nums ${stateColor}`}>
        {d.state}
      </span>
      {d.target ? (
        <span className="text-muted-foreground text-xs">{d.target}</span>
      ) : null}
      <span
        className={`min-w-0 flex-1 truncate ${compact ? "text-xs" : ""}`}
        title={d.commitMessage ?? d.url}
      >
        {d.commitSha ? (
          <span className="text-muted-foreground me-2 inline-flex items-center gap-1 font-mono text-xs">
            <GitCommit className="size-3" />
            {d.commitSha.slice(0, 7)}
          </span>
        ) : null}
        {d.commitMessage ?? d.url}
      </span>
      <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
        <Clock className="size-3" />
        {relativeTime(new Date(d.createdAt).toISOString())}
      </span>
    </a>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
  accent = "muted",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
  accent?: "ok" | "bad" | "muted";
}) {
  const valueColor =
    accent === "ok"
      ? "text-emerald-600 dark:text-emerald-400"
      : accent === "bad"
        ? "text-destructive"
        : "text-foreground";
  return (
    <div>
      <div className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-medium tracking-wide uppercase">
        <Icon className="size-3" />
        {label}
      </div>
      <div className={`mt-1 text-lg font-semibold tabular-nums ${valueColor}`}>
        {value}
      </div>
      {hint ? (
        <div className="text-muted-foreground mt-0.5 text-xs">{hint}</div>
      ) : null}
    </div>
  );
}

function relativeTime(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hr ago`;
  return `${Math.floor(s / 86400)} d ago`;
}
