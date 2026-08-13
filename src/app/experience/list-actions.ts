"use server";

import {
  listPublishedExperienceCursor,
  type ExperiencePage,
} from "@/lib/db/queries/experience";
import { PAGE_NEXT } from "@/lib/pagination";

export async function loadMorePublishedExperience(
  cursor: string,
): Promise<ExperiencePage> {
  return listPublishedExperienceCursor({ cursor, limit: PAGE_NEXT });
}
