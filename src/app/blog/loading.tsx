import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-24 pb-24 sm:px-6">
      <header className="mb-14 max-w-2xl">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-4 h-10 w-3/4 sm:h-12" />
        <Skeleton className="mt-3 h-5 w-full" />
        <Skeleton className="mt-2 h-5 w-4/5" />
      </header>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="rounded-xl ring-1 ring-black/5">
            <Skeleton className="aspect-[16/10] w-full rounded-t-xl" />
            <div className="flex flex-col gap-3 p-5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
