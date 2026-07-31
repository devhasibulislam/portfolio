import { z } from "zod";

export const resumeInput = z.object({
  publicId: z.string().min(1),
  url: z.string().url(),
  originalName: z.string().min(1).max(255),
  bytes: z.number().int().positive(),
});

export type ResumeInput = z.infer<typeof resumeInput>;
