"use client"

import { useEffect } from "react"
import { TimePicker } from "react-wheel-time-picker"

interface TimePickerFieldProps {
  value: string
  onChange: (val: string) => void
  className?: string
}

export default function TimePickerField({ value, onChange, className = "" }: TimePickerFieldProps) {
  useEffect(() => {
    const style = document.createElement("style")
    style.textContent = `
      button.bg-black { background-color: #000 !important; }
      button.bg-white { background-color: #fff !important; }
      button.hover\\:bg-gray-800:hover { background-color: #1f2937 !important; }
      button.hover\\:bg-gray-50:hover { background-color: #f9fafb !important; }
    `
    document.head.appendChild(style)
    return () => style.remove()
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
