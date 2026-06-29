"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { useTour, TourProvider } from "./TourContext"
import TourEngine from "./TourEngine"
import TourCompleted from "./TourCompleted"
import type { TourRole } from "./types"

function TourInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { handleRouteChange } = useTour()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (pathname) setReady(true)
  }, [pathname])

  return (
    <>
      {children}
      {ready && (
        <>
          <TourEngine />
          <TourCompleted />
        </>
      )}
    </>
  )
}

export function TourProviderWrapper({
  role,
  children,
}: {
  role: TourRole
  children: React.ReactNode
}) {
  return (
    <TourProvider role={role}>
      <TourShell role={role}>{children}</TourShell>
    </TourProvider>
  )
}

function TourShell({
  role,
  children,
}: {
  role: TourRole
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { handleRouteChange } = useTour()

  useEffect(() => {
    if (pathname) {
      handleRouteChange(pathname, role)
    }
  }, [pathname, handleRouteChange, role])

  return <TourInner>{children}</TourInner>
}
