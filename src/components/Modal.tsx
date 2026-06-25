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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className={
          fullScreen
            ? "relative bg-white w-full h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto sm:rounded-[25px] sm:p-8 p-4 sm:max-w-lg sm:m-4"
            : `relative bg-white w-full rounded-t-[25px] sm:rounded-[25px] p-4 sm:p-8 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto scrollbar-hide sm:mb-0 mb-24 ${sizeClass[size]} sm:w-full`
        }
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight">{title}</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFullScreen(!fullScreen)}
              className="sm:hidden p-2 hover:bg-gray-100 rounded-full transition-all"
              aria-label={fullScreen ? "Salir de pantalla completa" : "Pantalla completa"}
            >
              {fullScreen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 14 10 14 10 20" />
                  <polyline points="20 10 14 10 14 4" />
                  <line x1="14" y1="10" x2="21" y2="3" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 3 21 3 21 9" />
                  <polyline points="9 21 3 21 3 15" />
                  <line x1="21" y1="3" x2="14" y2="10" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </svg>
              )}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all" aria-label="Cerrar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {children}
      </div>
    </div>
  )
}
