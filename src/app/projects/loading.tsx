import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pt-24 pb-24">
      <header className="mb-14 max-w-2xl">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="mt-4 h-12 w-56" />
        <Skeleton className="mt-3 h-4 w-full max-w-md" />
        <Skeleton className="mt-2 h-4 w-2/3" />
      </header>
      <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="flex flex-col gap-3">
            <Skeleton className="aspect-[1200/630] w-full rounded-lg" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </li>
        ))}
      </ul>
    </main>
  );
}
