import { Skeleton } from "@/components/ui/skeleton";

function ProductSummarySkeleton() {
  return (
    <div className="w-full flex flex-col gap-4 min-[1160px]:flex-row min-[1160px]:gap-12">
      <div className="w-full h-full flex-1 flex flex-col gap-4 md:flex-row md:items-stretch">
        <Skeleton className="w-full aspect-square rounded-xl" />

        <div className="p-1 flex gap-3 overflow-hidden md:flex-col">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-20 w-20 min-w-20 rounded-xl"
            />
          ))}
        </div>
      </div>

      <div className="w-full max-w-93 grid gap-3">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24 rounded-md" />
          <Skeleton className="h-6 w-28 rounded-md" />
        </div>

        <div className="grid gap-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        <div className="grid gap-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-11 w-full rounded-md" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-11 w-full rounded-md" />
          <Skeleton className="h-7 w-32" />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:max-w-96">
          <Skeleton className="h-11 w-full rounded-md" />
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function DetailSectionSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="max-w-full py-12 flex flex-col gap-10">
      <Skeleton className="h-8 w-44" />
      <div className="max-w-lg flex flex-col gap-3">
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            className={index === lines - 1 ? "h-4 w-3/5" : "h-4 w-full"}
          />
        ))}
      </div>
    </div>
  );
}

function ReviewsSkeleton() {
  return (
    <div className="py-12 flex flex-col gap-10">
      <div className="max-w-full p-12 flex flex-col gap-5 rounded-2xl border bg-muted">
        <Skeleton className="h-8 w-28" />

        <div className="w-full flex flex-col gap-4 md:flex-row">
          <div className="py-4 pr-8 flex flex-col gap-4 justify-end">
            <div className="flex gap-2 items-center">
              <Skeleton className="h-16 w-24" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-11 w-64 rounded-md" />
          </div>

          <div className="min-w-72 py-4 pr-8 flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="flex gap-4">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="flex-1 flex flex-col gap-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <Skeleton className="h-10 w-48 rounded-md" />
      </div>
    </div>
  );
}

function RelatedSectionSkeleton() {
  return (
    <div className="max-w-full py-12 flex flex-col gap-10">
      <Skeleton className="h-8 w-56" />
      <div className="grid grid-flow-col grid-rows-2 gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="w-64 rounded-xl border p-3">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="mt-3 flex flex-col gap-2">
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProductDetailsLoading() {
  return (
    <>
      <div className="py-4 flex items-center gap-3">
        <Skeleton className="size-4 rounded-sm" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4 rounded-sm" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-4 rounded-sm" />
        <Skeleton className="h-4 w-36" />
      </div>

      <div className="pt-4 pb-12">
        <ProductSummarySkeleton />
      </div>

      <DetailSectionSkeleton lines={4} />
      <DetailSectionSkeleton lines={5} />
      <ReviewsSkeleton />
      <RelatedSectionSkeleton />
      <RelatedSectionSkeleton />
    </>
  );
}
