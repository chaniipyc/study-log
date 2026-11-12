export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 md:pt-14" aria-busy="true" aria-label="불러오는 중">
      <div className="h-7 w-40 animate-pulse rounded-pill bg-surface-2" />
      <div className="mt-3 h-4 w-64 animate-pulse rounded-pill bg-surface-2" />
      <div className="mt-8 flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card h-32 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
