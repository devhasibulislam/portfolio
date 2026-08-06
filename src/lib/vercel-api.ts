import { cacheLife, cacheTag } from "next/cache";
import { tag } from "@/lib/cache-tags";

/**
 * Thin wrapper over the Vercel REST API — only the endpoints the
 * dashboard analytics widget needs. Docs: https://vercel.com/docs/rest-api
 *
 * Everything goes through `getVercelAnalytics()` which is wrapped in
 * `"use cache"` + `cacheTag(tag.vercelAnalytics())` + `cacheLife` so the
 * dashboard page load doesn't hit the Vercel API on every navigation.
 * Hobby-tier rate limits + shared Speed Insights quota mean caching is
 * required, not optional.
 */

const VERCEL_API = "https://api.vercel.com";

type ProjectResponse = {
  id: string;
  name: string;
  framework: string | null;
  nodeVersion: string | null;
  createdAt: number;
  updatedAt: number | null;
  live: boolean;
  latestDeployment?: {
    id: string;
    url: string;
    createdAt: number;
    readyState: string;
    target: string | null;
  };
  domains?: string[];
  speedInsights?: { id: string; hasData?: boolean } | null;
  webAnalytics?: { id: string; enabledAt?: number } | null;
};

type DeploymentsResponse = {
  deployments: Array<{
    uid: string;
    url: string;
    created: number;
    state: string; // BUILDING, READY, ERROR, CANCELED, QUEUED
    target: string | null;
    meta?: { githubCommitMessage?: string; githubCommitSha?: string };
  }>;
};

export type VercelDeployment = {
  id: string;
  url: string;
  createdAt: number;
  state: string;
  target: string | null;
  commitMessage: string | null;
  commitSha: string | null;
};

export type VercelAnalytics = {
  configured: boolean;
  projectId: string | null;
  projectName: string | null;
  framework: string | null;
  nodeVersion: string | null;
  productionUrl: string | null;
  domains: string[];
  createdAt: number | null;
  updatedAt: number | null;
  speedInsightsEnabled: boolean;
  speedInsightsHasData: boolean;
  webAnalyticsEnabled: boolean;
  latestDeployment: VercelDeployment | null;
  recentDeployments: VercelDeployment[];
  deployCounts: { ready: number; error: number; building: number };
  fetchedAt: string;
  error: string | null;
};

const EMPTY: VercelAnalytics = {
  configured: false,
  projectId: null,
  projectName: null,
  framework: null,
  nodeVersion: null,
  productionUrl: null,
  domains: [],
  createdAt: null,
  updatedAt: null,
  speedInsightsEnabled: false,
  speedInsightsHasData: false,
  webAnalyticsEnabled: false,
  latestDeployment: null,
  recentDeployments: [],
  deployCounts: { ready: 0, error: 0, building: 0 },
  fetchedAt: new Date().toISOString(),
  error: null,
};

async function vercelFetch<T>(path: string): Promise<T> {
  const token = process.env.VERCEL_TOKEN;
  if (!token) throw new Error("VERCEL_TOKEN is not set");
  const res = await fetch(`${VERCEL_API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    // Cached at the page boundary via `"use cache"` below — opt out of
    // Next's per-fetch cache to keep the boundary explicit.
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Vercel API ${res.status}: ${body.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

/**
 * Cached aggregate: project details + recent deployments. One boundary =
 * one round-trip per revalidation window.
 */
export async function getVercelAnalytics(): Promise<VercelAnalytics> {
  "use cache";
  cacheTag(tag.vercelAnalytics());
  // Refresh every 5 minutes; hold stale up to an hour if the API is down.
  // Manual refresh from the UI busts the tag directly.
  cacheLife({ revalidate: 300, expire: 3600 });

  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;
  if (!projectId || !teamId || !process.env.VERCEL_TOKEN) {
    return { ...EMPTY, configured: false };
  }

  const teamQuery = `teamId=${teamId}`;

  try {
    const [proj, deploys] = await Promise.all([
      vercelFetch<ProjectResponse>(`/v10/projects/${projectId}?${teamQuery}`),
      vercelFetch<DeploymentsResponse>(
        `/v6/deployments?projectId=${projectId}&${teamQuery}&limit=10`,
      ),
    ]);

    const recent: VercelDeployment[] = deploys.deployments.map((d) => ({
      id: d.uid,
      url: d.url,
      createdAt: d.created,
      state: d.state,
      target: d.target,
      commitMessage: d.meta?.githubCommitMessage ?? null,
      commitSha: d.meta?.githubCommitSha ?? null,
    }));

    // Deploy state counts across the last 10 deploys — quick health signal
    // (are recent pushes green or red).
    const deployCounts = recent.reduce(
      (acc, d) => {
        if (d.state === "READY") acc.ready++;
        else if (d.state === "ERROR" || d.state === "CANCELED") acc.error++;
        else if (d.state === "BUILDING" || d.state === "QUEUED") acc.building++;
        return acc;
      },
      { ready: 0, error: 0, building: 0 },
    );

    const latest = proj.latestDeployment
      ? {
          id: proj.latestDeployment.id,
          url: proj.latestDeployment.url,
          createdAt: proj.latestDeployment.createdAt,
          state: proj.latestDeployment.readyState,
          target: proj.latestDeployment.target,
          commitMessage: null,
          commitSha: null,
        }
      : (recent[0] ?? null);

    // Prefer a custom domain > the *.vercel.app alias > the deployment URL.
    // Skip the auto-generated `-git-branch-…` domains.
    const domains = proj.domains ?? [];
    const productionUrl =
      domains.find((d) => !d.endsWith(".vercel.app") && !d.includes("-git-")) ??
      domains.find((d) => !d.includes("-git-")) ??
      (latest ? `https://${latest.url}` : null);

    return {
      configured: true,
      projectId: proj.id,
      projectName: proj.name,
      framework: proj.framework,
      nodeVersion: proj.nodeVersion,
      productionUrl,
      domains,
      createdAt: proj.createdAt,
      updatedAt: proj.updatedAt,
      speedInsightsEnabled: Boolean(proj.speedInsights?.id),
      speedInsightsHasData: Boolean(proj.speedInsights?.hasData),
      webAnalyticsEnabled: Boolean(proj.webAnalytics?.id),
      latestDeployment: latest,
      recentDeployments: recent,
      deployCounts,
      fetchedAt: new Date().toISOString(),
      error: null,
    };
  } catch (err) {
    return {
      ...EMPTY,
      configured: true,
      projectId,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
