export default function AnalyticsLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Top Bar skeleton */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="h-6 w-32 bg-zinc-800 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-20 bg-zinc-800 rounded animate-pulse" />
          <div className="h-8 w-16 bg-zinc-800 rounded animate-pulse" />
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* Filter Bar skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-20 bg-zinc-800 rounded animate-pulse" />
          <div className="h-8 w-40 bg-zinc-800 rounded animate-pulse" />
        </div>

        {/* Stats Cards skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2">
              <div className="h-4 w-16 bg-zinc-800 rounded animate-pulse" />
              <div className="h-8 w-12 bg-zinc-800 rounded animate-pulse" />
              <div className="h-4 w-10 bg-zinc-800 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Chart skeleton */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 min-h-[300px]">
          <div className="h-full flex items-end gap-1">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-zinc-800 rounded-t animate-pulse"
                style={{ height: `${30 + Math.random() * 50}%` }}
              />
            ))}
          </div>
        </div>

        {/* Projects skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
              <div className="h-5 w-32 bg-zinc-800 rounded animate-pulse" />
              <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse" />
              <div className="pt-3 border-t border-zinc-800 flex gap-6">
                <div className="h-8 w-16 bg-zinc-800 rounded animate-pulse" />
                <div className="h-8 w-16 bg-zinc-800 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
