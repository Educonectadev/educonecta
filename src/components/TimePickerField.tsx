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
        className={`w-full rounded-[30px] border border-gray-200 bg-white px-4 py-2.5 text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all text-left ${className}`}
      >
        {value || "Seleccionar hora"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />

          <div
            ref={panelRef}
            className="relative w-full max-w-sm rounded-t-2xl sm:rounded-2xl bg-black p-6 shadow-xl border border-gray-800"
          >
            <TimePicker
              value={value}
              onChange={onChange}
              itemHeight={40}
              visibleCount={5}
              loop
            />

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-4 w-full rounded-[30px] bg-white px-4 py-2.5 text-sm font-medium text-black transition-all hover:bg-gray-100"
            >
              Listo
            </button>
          </div>
        </div>
      )}
    </>
  )
}
