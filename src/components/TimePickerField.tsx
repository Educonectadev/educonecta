"use client"

import { useState, useRef, useEffect } from "react"
import { TimePicker } from "@poursha98/react-ios-time-picker"

interface TimePickerFieldProps {
  value: string
  onChange: (val: string) => void
  className?: string
}

export default function TimePickerField({ value, onChange, className = "" }: TimePickerFieldProps) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler, true)
    return () => document.removeEventListener("mousedown", handler, true)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className={`w-full rounded-[30px] border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white/90 focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-left ${className}`}
      >
        {value || "Seleccionar hora"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setOpen(false)} />

          <div
            ref={panelRef}
            className="relative w-full max-w-xs rounded-2xl bg-neutral-900 p-6 shadow-2xl"
          >
            <p className="mb-5 text-center text-sm font-medium tracking-wide text-neutral-400 uppercase">
              Seleccionar hora
            </p>

            <TimePicker
              value={value}
              onChange={onChange}
              itemHeight={38}
              visibleCount={5}
              loop
            />

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-5 w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition-all active:scale-95 hover:bg-neutral-100"
            >
              Listo
            </button>
          </div>
        </div>
      )}
    </>
  )
}
