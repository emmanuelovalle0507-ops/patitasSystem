import { Skeleton } from "@/components/ui/skeleton";

export default function PostDetailLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="space-y-3">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28" />
        ))}
      </div>
      <div className="space-y-3">
        <Skeleton className="h-6 w-40" />
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-16 flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}
