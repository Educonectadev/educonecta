export function DashboardSkeleton({ sections = 3 }: { sections?: number }) {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 rounded-lg bg-gray-200 dark:bg-gray-800" />
      <div className="h-4 w-96 rounded-lg bg-gray-200 dark:bg-gray-800" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: sections }, (_, i) => (
          <div key={i} className="h-32 rounded-xl bg-gray-100 dark:bg-gray-900" />
        ))}
      </div>
    </div>
  )
}
