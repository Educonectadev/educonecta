"use client"

import { TimePicker } from "react-wheel-time-picker"

interface TimePickerFieldProps {
  value: string
  onChange: (val: string) => void
  className?: string
}

export default function TimePickerField({ value, onChange, className = "" }: TimePickerFieldProps) {
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
