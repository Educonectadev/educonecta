import { DashboardSkeleton } from "@/components/DashboardSkeleton"

export default function StudentLoading() {
  return (
    <div className="p-4 md:p-8">
      <DashboardSkeleton sections={3} />
    </div>
  )
}
