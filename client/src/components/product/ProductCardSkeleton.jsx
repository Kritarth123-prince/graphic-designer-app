export default function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-ink/5 aspect-[4/5]" />
      <div className="mt-4 flex justify-between">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-ink/10" />
          <div className="h-3 w-20 bg-ink/5" />
        </div>
        <div className="space-y-2 text-right">
          <div className="h-4 w-16 bg-ink/10 ml-auto" />
          <div className="h-3 w-14 bg-ink/5 ml-auto" />
        </div>
      </div>
    </div>
  );
}
