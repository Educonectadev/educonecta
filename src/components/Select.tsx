"use client"

import { Fragment } from "react"
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from "@headlessui/react"

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
  disabled?: boolean
}

export default function Select({ value, onChange, options, placeholder = "Seleccionar...", className = "", disabled }: SelectProps) {
  const selected = options.find((o) => o.value === value)

  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      {({ open }) => (
        <div className={`relative ${className}`}>
          {open && (
            <div className="fixed inset-0 bg-black/40 z-40 max-[640px]:block hidden" />
          )}
          <ListboxButton
            className={`w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm text-left
              focus:border-black focus:outline-none focus:ring-1 focus:ring-black
              transition-all cursor-pointer
              flex items-center justify-between gap-2
              ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-gray-300"}
              ${value ? "text-[#1a1a1a]" : "text-gray-400"}`}
          >
            <span className="truncate">{selected ? selected.label : placeholder}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </ListboxButton>
          <Transition
            as={Fragment}
            enter="ease-out duration-150"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="ease-in duration-100"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <ListboxOptions
              portal
              anchor="bottom"
              className="z-20 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg
                max-h-60 overflow-y-auto scrollbar-hide p-1.5 min-w-[var(--button-width)]
                max-[640px]:!fixed max-[640px]:!inset-x-4 max-[640px]:!top-1/2 max-[640px]:!-translate-y-1/2
                max-[640px]:max-h-[60vh] max-[640px]:!w-auto max-[640px]:!m-0"
            >
              {options.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-400 text-center">Sin opciones</div>
              ) : (
                options.map((opt) => (
                  <ListboxOption
                    key={opt.value}
                    value={opt.value}
                    className={({ focus, selected }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-[10px] text-sm cursor-pointer transition-colors
                      ${focus ? "bg-gray-100" : ""}
                      ${selected ? "bg-black text-white" : "text-[#1a1a1a]"}`}
                  >
                    {({ selected }) => (
                      <>
                        <span className="truncate flex-1">{opt.label}</span>
                        {selected && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </>
                    )}
                  </ListboxOption>
                ))
              )}
            </ListboxOptions>
          </Transition>
        </div>
      )}
    </Listbox>
  )
}
