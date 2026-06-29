import { DashboardSkeleton } from "@/components/DashboardSkeleton"

export default function AdminLoading() {
  return (
    <div className="p-4 md:p-8">
      <DashboardSkeleton sections={4} />
    </div>
  )
}
