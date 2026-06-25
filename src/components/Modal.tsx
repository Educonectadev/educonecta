"use client"

import { Fragment } from "react"
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react"

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl" | "2xl"
}

const sizeClass: Record<string, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
}

export default function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/20" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel
              className={`w-full sm:rounded-xl rounded-t-xl bg-white p-5 sm:p-6 shadow-lg
                overflow-y-auto scrollbar-hide
                max-h-[85vh] sm:max-h-[85vh]
                sm:mb-0 mb-24
                ${sizeClass[size]}`}
            >
              <div className="flex items-center justify-between mb-5">
                <DialogTitle as="h2" className="text-base sm:text-lg font-semibold text-gray-900">
                  {title}
                </DialogTitle>
                <button
                  onClick={onClose}
                  className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
                  aria-label="Cerrar"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {children}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}
