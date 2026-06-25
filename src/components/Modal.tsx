"use client"

import { useState, useEffect } from "react"

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl" | "2xl"
}

export default function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  const [fullScreen, setFullScreen] = useState(false)

  useEffect(() => {
    if (!open) setFullScreen(false)
  }, [open])

  if (!open) return null

  const sizeClass: Record<string, string> = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    "2xl": "sm:max-w-2xl",
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/20 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className={
          fullScreen
            ? "relative bg-white w-full h-full sm:h-auto sm:max-h-[85vh] overflow-y-auto sm:rounded-[17px] p-5 sm:p-6 sm:max-w-lg sm:m-3 animate-slide-up"
            : `relative bg-white w-full rounded-t-[17px] sm:rounded-[17px] p-5 sm:p-6 max-h-[85vh] sm:max-h-[85vh] overflow-y-auto scrollbar-hide sm:mb-0 mb-24 shadow-lg sm:shadow-lg ${sizeClass[size]} animate-slide-up`
        }
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base sm:text-lg font-semibold tracking-tight text-[#1a1a1a]">{title}</h2>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setFullScreen(!fullScreen)}
              className="sm:hidden w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors text-gray-400"
              aria-label={fullScreen ? "Salir de pantalla completa" : "Pantalla completa"}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {fullScreen ? (
                  <>
                    <polyline points="4 14 10 14 10 20" />
                    <polyline points="20 10 14 10 14 4" />
                    <line x1="14" y1="10" x2="21" y2="3" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </>
                ) : (
                  <>
                    <polyline points="15 3 21 3 21 9" />
                    <polyline points="9 21 3 21 3 15" />
                    <line x1="21" y1="3" x2="14" y2="10" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </>
                )}
              </svg>
            </button>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors text-gray-400" aria-label="Cerrar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
        <div className="border-t border-gray-100 -mx-5 sm:-mx-6 mb-5" />

        {children}
      </div>
    </div>
  )
}
