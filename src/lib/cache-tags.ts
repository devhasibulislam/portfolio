/**
 * Cache tags per PROJECT_CONTEXT §13. Every mutation server action calls
 * `revalidateTag(tag.<entity>())` — public routes read with the matching
 * `cacheTag()`. Keep this the single source of truth for tag strings.
 */
export const tag = {
  categories: () => "categories",
  tags: () => "tags",
  posts: () => "posts",
  post: (slug: string) => `post:${slug}`,
  media: () => "media",
  resumes: () => "resumes",
  activeResume: () => "resume:active",
  // New CMS entities (project/experience/skill). Collection tags cover
  // list pages; per-slug tags let mutations surgically bust one detail
  // page without dumping the whole collection cache.
  projects: () => "projects",
  project: (slug: string) => `project:${slug}`,
  experiences: () => "experiences",
  experience: (slug: string) => `experience:${slug}`,
  skills: () => "skills",
};
