import { DashboardSkeleton } from "@/components/DashboardSkeleton"

export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <DashboardSkeleton />
    </div>
  )
}
