import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonLoader() {
  // Create an array with 3 elements to show 3 skeleton flashcards
  const skeletons = Array.from({ length: 3 }, (_, i) => i);

  return (
    <div className="w-full space-y-6">
      <div className="text-lg font-semibold text-gray-700">Generating flashcards...</div>

      {skeletons.map((index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex flex-col gap-4">
            {/* Front of flashcard skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-6 w-full" />
            </div>

            <div className="border-t border-gray-200 my-2"></div>

            {/* Back of flashcard skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
            </div>

            {/* Action buttons skeleton */}
            <div className="flex gap-2 mt-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
