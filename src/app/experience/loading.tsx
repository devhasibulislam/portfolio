import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 pt-24 pb-24">
      <header className="mb-14 max-w-2xl">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="mt-4 h-12 w-56" />
        <Skeleton className="mt-3 h-4 w-full max-w-md" />
        <Skeleton className="mt-2 h-4 w-2/3" />
      </header>
      <ul className="flex flex-col gap-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i} className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-md" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-2/3" />
          </li>
        ))}
      </ul>
    </main>
  );
}
