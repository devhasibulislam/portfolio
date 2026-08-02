import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-20 pb-16 sm:px-6 sm:pt-24 sm:pb-24">
      <Skeleton className="mb-8 h-8 w-28" />
      <div className="mb-10 flex flex-col gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full sm:h-14" />
        <Skeleton className="h-10 w-4/5 sm:h-14" />
        <div className="mt-2 flex gap-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="mb-10 aspect-[1.91/1] w-full rounded-xl" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-4"
            style={{ width: `${65 + ((i * 7) % 30)}%` }}
          />
        ))}
      </div>
    </main>
  );
}
