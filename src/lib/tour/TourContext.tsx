"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { TourRole, TourStep } from "./types"
import { getStepsForRoute } from "./registry"
import {
  isTourCompleted,
  markTourCompleted,
  getForceRestart,
  clearForceRestart,
} from "./storage"

interface TourContextType {
  isOpen: boolean
  showCompletion: boolean
  currentIndex: number
  steps: TourStep[]
  start: () => void
  next: () => void
  prev: () => void
  skip: () => void
  finish: () => void
  dismissCompletion: () => void
  handleRouteChange: (route: string, role: TourRole) => void
}

const TourContext = createContext<TourContextType>({
  isOpen: false,
  showCompletion: false,
  currentIndex: 0,
  steps: [],
  start: () => {},
  next: () => {},
  prev: () => {},
  skip: () => {},
  finish: () => {},
  dismissCompletion: () => {},
  handleRouteChange: () => {},
})

export function useTour() {
  return useContext(TourContext)
}

export function TourProvider({
  role,
  children,
}: {
  role: TourRole
  children: ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [steps, setSteps] = useState<TourStep[]>([])
  const [hasStarted, setHasStarted] = useState(false)

  const handleRouteChange = useCallback(
    (route: string, r: TourRole) => {
      const s = getStepsForRoute(route, r)
      if (s.length > 0) {
        setSteps(s)
        if (!hasStarted) {
          const force = getForceRestart()
          if (force || !isTourCompleted()) {
            setHasStarted(true)
            setShowCompletion(false)
            setCurrentIndex(0)
            setIsOpen(true)
          }
        }
      }
    },
    [hasStarted],
  )

  const start = useCallback(() => {
    setShowCompletion(false)
    setCurrentIndex(0)
    setIsOpen(true)
  }, [])

  const next = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, steps.length - 1))
  }, [steps.length])

  const prev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0))
  }, [])

  const skip = useCallback(() => {
    setIsOpen(false)
    setShowCompletion(false)
    markTourCompleted()
    clearForceRestart()
  }, [])

  const finish = useCallback(() => {
    setShowCompletion(true)
    markTourCompleted()
    clearForceRestart()
  }, [])

  const dismissCompletion = useCallback(() => {
    setIsOpen(false)
    setShowCompletion(false)
  }, [])

  useEffect(() => {
    if (!isOpen || showCompletion) return
    const step = steps[currentIndex]
    if (!step) return
    const el = document.querySelector(step.selector)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [currentIndex, steps, isOpen, showCompletion])

  return (
    <TourContext.Provider
      value={{
        isOpen,
        showCompletion,
        currentIndex,
        steps,
        start,
        next,
        prev,
        skip,
        finish,
        dismissCompletion,
        handleRouteChange,
      }}
    >
      {children}
    </TourContext.Provider>
  )
}
