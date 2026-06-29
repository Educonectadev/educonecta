"use client"

import { ScrollShadow } from "@heroui/react"
import type { ReactNode } from "react"

export default function DashboardContent({ children }: { children: ReactNode }) {
  return (
    <ScrollShadow hideScrollBar className="flex-1 h-full" size={40}>
      {children}
    </ScrollShadow>
  )
}
