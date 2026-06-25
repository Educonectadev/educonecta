"use client"

import { useEffect, useRef } from "react"
import { TimePicker } from "react-wheel-time-picker"

interface TimePickerFieldProps {
  value: string
  onChange: (val: string) => void
  className?: string
}

export default function TimePickerField({ value, onChange, className = "" }: TimePickerFieldProps) {
  const injected = useRef(false)

  useEffect(() => {
    if (injected.current) return
    injected.current = true

    const id = "__tp-fix"
    if (document.getElementById(id)) return

    const style = document.createElement("style")
    style.id = id
    style.innerHTML = `
      button.rounded-\\[30px\\] {
        background: revert-layer;
        border: revert-layer;
      }
    `
    document.head.appendChild(style)
  }, [])

  return (
    <TimePicker
      value={value}
      onChange={onChange}
      onSave={onChange}
      controllers
      inputClassName={`w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all ${className}`}
    />
  )
}
