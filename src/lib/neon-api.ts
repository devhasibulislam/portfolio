import { cacheLife, cacheTag } from "next/cache";
import { tag } from "@/lib/cache-tags";

/**
 * Thin wrapper over the Neon Management API — only the endpoints the
 * dashboard analytics widget needs. Docs: https://neon.com/docs/reference/api
 *
 * Every consumer goes through `getNeonAnalytics()` which is wrapped in
 * `"use cache"` + `cacheTag(tag.neonAnalytics())` + `cacheLife` so the
 * dashboard page load doesn't hit the Neon API on every navigation.
 * Free-tier: 190 CU-hours/month + rate-limited API keys — caching is
 * mandatory, not optional.
 */

const NEON_API = "https://console.neon.tech/api/v2";

type ProjectResponse = {
  project: {
    id: string;
    name: string;
    region_id: string;
    pg_version: number;
    // NOTE: the single-project endpoint uses different field names than
    // the list-projects endpoint. Keep the mapping in sync with
    // https://neon.com/docs/reference/api → GET /projects/{project_id}.
    active_time_seconds: number;
    compute_time_seconds: number;
    cpu_used_sec: number;
    data_transfer_bytes: number;
    written_data_bytes: number;
    synthetic_storage_size: number;
    branch_logical_size_limit_bytes: number;
    consumption_period_end: string;
    consumption_period_start: string;
    created_at: string;
    default_endpoint_settings?: {
      autoscaling_limit_min_cu?: number;
      autoscaling_limit_max_cu?: number;
      suspend_timeout_seconds?: number;
    };
  };
};

type BranchesResponse = {
  branches: Array<{
    id: string;
    name: string;
    primary?: boolean;
    default?: boolean;
    created_at: string;
    updated_at: string;
  }>;
};

export type NeonAnalytics = {
  configured: boolean;
  projectId: string | null;
  projectName: string | null;
  region: string | null;
  pgVersion: number | null;
  activeTimeSeconds: number;
  computeTimeSeconds: number;
  cpuUsedSeconds: number;
  dataTransferBytes: number;
  writtenDataBytes: number;
  storageBytes: number;
  storageLimitBytes: number;
  periodStart: string | null;
  periodEnd: string | null;
  branchCount: number;
  primaryBranch: string | null;
  autoscalingMinCu: number | null;
  autoscalingMaxCu: number | null;
  suspendTimeoutSeconds: number | null;
  fetchedAt: string;
  error: string | null;
};

const EMPTY: NeonAnalytics = {
  configured: false,
  projectId: null,
  projectName: null,
  region: null,
  pgVersion: null,
  activeTimeSeconds: 0,
  computeTimeSeconds: 0,
  cpuUsedSeconds: 0,
  dataTransferBytes: 0,
  writtenDataBytes: 0,
  storageBytes: 0,
  storageLimitBytes: 0,
  periodStart: null,
  periodEnd: null,
  branchCount: 0,
  primaryBranch: null,
  autoscalingMinCu: null,
  autoscalingMaxCu: null,
  suspendTimeoutSeconds: null,
  fetchedAt: new Date().toISOString(),
  error: null,
};

async function neonFetch<T>(path: string): Promise<T> {
  const key = process.env.NEON_API_KEY;
  if (!key) throw new Error("NEON_API_KEY is not set");
  const res = await fetch(`${NEON_API}${path}`, {
    headers: {
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
    },
    // Neon API responses are already cached at our page boundary; opting
    // out of Next's per-fetch cache keeps things predictable.
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Neon API ${res.status}: ${body.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

/**
 * Cached aggregate: project details + branch count. One boundary means one
 * network round-trip per revalidation window, no matter how many dashboard
 * cards read from it.
 */
export async function getNeonAnalytics(): Promise<NeonAnalytics> {
  "use cache";
  cacheTag(tag.neonAnalytics());
  // Refresh every 5 minutes; hold stale for up to an hour if the API is
  // down. Manual refresh from the UI busts the tag directly.
  cacheLife({ revalidate: 300, expire: 3600 });

  const projectId = process.env.NEON_PROJECT_ID;
  if (!projectId || !process.env.NEON_API_KEY) {
    return { ...EMPTY, configured: false };
  }

  try {
    const [proj, branches] = await Promise.all([
      neonFetch<ProjectResponse>(`/projects/${projectId}`),
      neonFetch<BranchesResponse>(`/projects/${projectId}/branches`),
    ]);
    const p = proj.project;
    const primary =
      branches.branches.find((b) => b.primary || b.default) ??
      branches.branches[0];
    return {
      configured: true,
      projectId: p.id,
      projectName: p.name,
      region: p.region_id,
      pgVersion: p.pg_version,
      activeTimeSeconds: p.active_time_seconds,
      computeTimeSeconds: p.compute_time_seconds,
      cpuUsedSeconds: p.cpu_used_sec,
      dataTransferBytes: p.data_transfer_bytes,
      writtenDataBytes: p.written_data_bytes,
      storageBytes: p.synthetic_storage_size,
      storageLimitBytes: p.branch_logical_size_limit_bytes,
      periodStart: p.consumption_period_start,
      periodEnd: p.consumption_period_end,
      branchCount: branches.branches.length,
      primaryBranch: primary?.name ?? null,
      autoscalingMinCu:
        p.default_endpoint_settings?.autoscaling_limit_min_cu ?? null,
      autoscalingMaxCu:
        p.default_endpoint_settings?.autoscaling_limit_max_cu ?? null,
      suspendTimeoutSeconds:
        p.default_endpoint_settings?.suspend_timeout_seconds ?? null,
      fetchedAt: new Date().toISOString(),
      error: null,
    };
  } catch (err) {
    // Never throw from the dashboard load — return an empty payload with
    // the error string so the widget can render "unavailable" gracefully.
    return {
      ...EMPTY,
      configured: true,
      projectId,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
