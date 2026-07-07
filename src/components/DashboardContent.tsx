"use client"

import type { ReactNode } from "react"

export default function DashboardContent({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 h-full overflow-y-auto">
      {children}
    </div>
  )
}
