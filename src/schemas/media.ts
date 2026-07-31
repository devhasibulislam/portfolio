import { z } from "zod";

/**
 * Media metadata written by the server after Cloudinary confirms an upload.
 * File-size (≤ 1MB) and 1.91:1 crop are enforced in the upload UI/action,
 * not here — see blog-schemas.instructions.md.
 */
export const mediaInput = z.object({
  publicId: z.string().min(1),
  url: z.string().url(),
  originalName: z.string().min(1).max(255),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  bytes: z.number().int().positive().max(1_048_576, "Max 1MB"),
  format: z.string().min(1).max(16),
  folder: z.enum(["portfolio/posts", "portfolio/resume", "portfolio/links"]),
});

export type MediaInput = z.infer<typeof mediaInput>;
