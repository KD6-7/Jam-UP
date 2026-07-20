export default function SkeletonCard() {
  return (
    <div className="flex animate-pulse flex-col rounded-2xl border border-maroon/10 bg-cream-light p-4">
      <div className="flex h-52 items-center justify-center">
        <div className="h-44 w-40 -rotate-2 rounded-xl bg-maroon/10" />
      </div>
      <div className="mt-3 h-5 w-3/4 rounded bg-maroon/10" />
      <div className="mt-2 h-4 w-full rounded bg-maroon/10" />
      <div className="mt-4 flex items-center justify-between">
        <div className="h-6 w-16 rounded bg-maroon/10" />
        <div className="h-11 w-24 rounded-full bg-maroon/10" />
      </div>
    </div>
  );
}
