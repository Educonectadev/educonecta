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
  const inputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler, true)
    return () => document.removeEventListener("mousedown", handler, true)
  }, [open])

  return (
    <div className="relative" ref={inputRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full rounded-[30px] border border-gray-200 bg-white px-4 py-2.5 text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all text-left ${className}`}
      >
        {value || "Seleccionar hora"}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 bg-black rounded-2xl p-4 shadow-xl border border-gray-800 w-full min-w-[220px]">
          <TimePicker
            value={value}
            onChange={onChange}
            itemHeight={36}
            visibleCount={5}
          />
        </div>
      )}
    </div>
  )
}
