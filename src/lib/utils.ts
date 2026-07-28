import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** shadcn class combiner — merges Tailwind classes correctly. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
