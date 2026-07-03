"use client"

import { useTour } from "./TourContext"
import { setForceRestart } from "./storage"

export default function TourTrigger() {
  const { start, isOpen } = useTour()

  function handleRestart() {
    setForceRestart()
    if (!isOpen) start()
  }

  return (
    <button
      onClick={handleRestart}
      className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
      data-tour="restart-tour"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12a10 10 0 1 0 10-10" />
        <path d="M12 2v6h6" />
      </svg>
      Ver guía nuevamente
    </button>
  )
}
