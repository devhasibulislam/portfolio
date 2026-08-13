"use server";

import {
  listPublishedProjectsCursor,
  type ProjectsPage,
} from "@/lib/db/queries/projects";
import { PAGE_NEXT } from "@/lib/pagination";

export async function loadMorePublishedProjects(
  cursor: string,
): Promise<ProjectsPage> {
  return listPublishedProjectsCursor({ cursor, limit: PAGE_NEXT });
}
