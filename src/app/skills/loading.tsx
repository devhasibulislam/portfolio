import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 pt-24 pb-24">
      <header className="mb-12 max-w-2xl">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="mt-4 h-12 w-44" />
        <Skeleton className="mt-3 h-4 w-full max-w-md" />
        <Skeleton className="mt-2 h-4 w-2/3" />
      </header>
      <div className="flex flex-col gap-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <section key={i} className="flex flex-col gap-4">
            <Skeleton className="h-4 w-40" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 8 }).map((__, j) => (
                <Skeleton key={j} className="h-8 w-20 rounded-full" />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
