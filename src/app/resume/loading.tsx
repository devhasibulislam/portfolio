import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto flex h-[100svh] w-full max-w-5xl flex-col gap-3 overflow-hidden px-4 pt-20 pb-4 sm:gap-4 sm:px-6 sm:pt-24 sm:pb-6">
      <div className="flex shrink-0 items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-2 h-7 w-3/5 sm:h-10" />
        </div>
        <Skeleton className="size-9 shrink-0 rounded-md sm:h-11 sm:w-40" />
      </div>
      <div className="min-h-0 flex-1">
        <Skeleton className="h-full w-full" />
      </div>
    </main>
  );
}
