import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { resumes } from "@/lib/db/schema";

export type ResumeRow = {
  id: string;
  publicId: string;
  url: string;
  originalName: string;
  bytes: number;
  isActive: boolean;
  createdAt: Date;
};

export async function listResumes(): Promise<ResumeRow[]> {
  return db.select().from(resumes).orderBy(desc(resumes.createdAt));
}

export async function getActiveResume(): Promise<ResumeRow | null> {
  const [row] = await db
    .select()
    .from(resumes)
    .where(eq(resumes.isActive, true))
    .limit(1);
  return row ?? null;
}
