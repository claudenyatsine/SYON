// Skeleton loading screen shown instantly while the tutor dashboard data loads.
// This replaces the blank-screen delay users would otherwise experience.
export default function TutorLoading() {
  return (
    <div className="p-4 sm:p-6 space-y-8 max-w-7xl mx-auto animate-pulse">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-10 w-64 bg-muted rounded-lg" />
          <div className="h-4 w-80 bg-muted rounded" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-32 bg-muted rounded-full" />
          <div className="h-10 w-36 bg-muted rounded-full" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-muted rounded-xl" />
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64 bg-muted rounded-xl" />
          <div className="h-48 bg-muted rounded-xl" />
        </div>
        <div className="space-y-6">
          <div className="h-72 bg-muted rounded-xl" />
        </div>
      </div>

      {/* Quick actions */}
      <div className="space-y-4">
        <div className="h-8 w-40 bg-muted rounded" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
