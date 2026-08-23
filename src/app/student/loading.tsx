// Skeleton loading screen shown instantly while the student dashboard data loads.
export default function StudentLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Welcome header */}
      <div className="space-y-2">
        <div className="h-9 w-72 bg-muted rounded-lg" />
        <div className="h-4 w-80 bg-muted rounded" />
      </div>

      {/* AI Study Panel banner */}
      <div className="h-24 bg-muted rounded-xl" />

      {/* Course progress cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-4 space-y-3">
            <div className="h-5 w-32 bg-muted rounded" />
            <div className="h-32 bg-muted rounded-lg" />
            <div className="h-3 w-full bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* AI Tutor + Upcoming class */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-48 bg-muted rounded-xl" />
        <div className="h-72 bg-muted rounded-xl" />
      </div>
    </div>
  );
}
