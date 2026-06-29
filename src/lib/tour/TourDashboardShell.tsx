"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { TourProvider, useTour } from "./TourContext"
import TourEngine from "./TourEngine"
import TourCompleted from "./TourCompleted"
import type { TourRole } from "./types"
import "@/tour-steps"

function TourWatcher({ role }: { role: TourRole }) {
  const pathname = usePathname()
  const { handleRouteChange } = useTour()

  useEffect(() => {
    handleRouteChange(pathname, role)
  }, [pathname, handleRouteChange, role])

  return null
}

export default function TourDashboardShell({
  role,
  children,
}: {
  role: TourRole
  children: React.ReactNode
}) {
  return (
    <TourProvider role={role}>
      <TourWatcher role={role} />
      {children}
      <TourEngine />
      <TourCompleted />
    </TourProvider>
  )
}
