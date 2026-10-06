const SkeletonBlock = ({ className = "" }) => (
  <div
    aria-hidden="true"
    className={`animate-pulse rounded bg-slate-200 ${className}`}
  />
);

export const SessionSkeleton = () => (
  <main
    role="status"
    aria-label="Restoring session"
    className="min-h-screen bg-slate-50 p-6"
  >
    <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl gap-6">
      <SkeletonBlock className="hidden w-60 shrink-0 rounded-xl md:block" />
      <div className="flex-1 space-y-6">
        <SkeletonBlock className="h-20 rounded-xl" />
        <SkeletonBlock className="h-36 rounded-xl" />
        <SkeletonBlock className="h-72 rounded-xl" />
      </div>
    </div>
    <span className="sr-only">Restoring your session</span>
  </main>
);

export const DashboardSkeleton = () => (
  <div role="status" aria-label="Loading dashboard" className="space-y-6">
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="rounded-xl bg-white p-5 shadow-sm">
          <SkeletonBlock className="mb-5 h-10 w-10 rounded-lg" />
          <SkeletonBlock className="mb-3 h-4 w-2/3" />
          <SkeletonBlock className="h-8 w-1/2" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-8">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <SkeletonBlock className="mb-3 h-6 w-56" />
          <SkeletonBlock className="mb-6 h-4 w-72 max-w-full" />
          <div className="grid gap-4 lg:grid-cols-2">
            <SkeletonBlock className="h-24 rounded-lg" />
            <SkeletonBlock className="h-24 rounded-lg" />
          </div>
        </div>
        <ChartSkeleton />
      </div>
      <div className="col-span-12 xl:col-span-4">
        <SkeletonBlock className="h-[500px] rounded-xl" />
      </div>
    </div>
    <span className="sr-only">Loading dashboard data</span>
  </div>
);

export const ChartSkeleton = () => (
  <div
    role="status"
    aria-label="Loading expense chart"
    className="rounded-xl bg-white p-6 shadow-sm"
  >
    <SkeletonBlock className="mb-6 h-6 w-48" />
    <SkeletonBlock className="h-64 w-full rounded-lg" />
    <span className="sr-only">Loading expense chart</span>
  </div>
);

export const ExpenseRowsSkeleton = ({ rows = 5 }) =>
  Array.from({ length: rows }, (_, index) => (
    <tr key={index} aria-hidden="true" className="border-t">
      <td className="px-4 py-4"><SkeletonBlock className="h-4 w-24" /></td>
      <td className="px-4 py-4"><SkeletonBlock className="h-4 w-32" /></td>
      <td className="px-4 py-4"><SkeletonBlock className="h-4 w-20" /></td>
      <td className="px-4 py-4"><SkeletonBlock className="h-4 w-16" /></td>
      <td className="px-4 py-4"><SkeletonBlock className="mx-auto h-8 w-24" /></td>
    </tr>
  ));