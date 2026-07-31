import { z } from "zod";

/**
 * URL-safe slug: lowercase, digits, hyphen-separated. No leading/trailing/
 * doubled hyphens. Shared by post/category/tag (each with its own max).
 */
export const slug = (max: number) =>
  z
    .string()
    .min(1)
    .max(max)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "URL-safe slug required");

export const uuid = z.string().uuid();
