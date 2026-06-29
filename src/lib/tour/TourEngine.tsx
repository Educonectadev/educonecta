"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTour } from "./TourContext"

function getCoords(el: Element) {
  const r = el.getBoundingClientRect()
  return { top: r.top, left: r.left, width: r.width, height: r.height }
}

export default function TourEngine() {
  const { isOpen, currentIndex, steps, next, prev, skip, finish } = useTour()
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 })
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [tooltipPos, setTooltipPos] = useState<"top" | "bottom">("bottom")

  const step = steps[currentIndex]

  useEffect(() => {
    if (!isOpen || !step) return

    function update() {
      const el = document.querySelector(step.selector)
      if (el) {
        const c = getCoords(el)
        setCoords(c)
        const gap = 16
        const tHeight = tooltipRef.current?.offsetHeight ?? 200
        if (c.top - tHeight - gap < 0) {
          setTooltipPos("bottom")
        } else {
          setTooltipPos("top")
        }
      }
    }

    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [isOpen, step, currentIndex])

  if (!isOpen || !step) return null

  const isFirst = currentIndex === 0
  const isLast = currentIndex === steps.length - 1
  const total = steps.length

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[100] bg-black/40"
      />

      <motion.div
        key={step.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed z-[101] pointer-events-none"
        style={{
          top: coords.top - 4,
          left: coords.left - 4,
          width: coords.width + 8,
          height: coords.height + 8,
          borderRadius: 12,
          boxShadow: "0 0 0 4px rgba(255,255,255,0.9), 0 0 0 9999px rgba(0,0,0,0.4)",
        }}
      />

      <div
        ref={tooltipRef}
        className="fixed z-[102] pointer-events-auto"
        style={{
          left: Math.max(16, Math.min(coords.left + coords.width / 2 - 180, window.innerWidth - 360)),
          [tooltipPos === "bottom" ? "top" : "bottom"]:
            tooltipPos === "bottom"
              ? coords.top + coords.height + 16
              : window.innerHeight - coords.top + 16,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: tooltipPos === "bottom" ? 12 : -12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-[360px] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-700 overflow-hidden"
        >
          <div className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Paso {currentIndex + 1} de {total}
            </p>
            <h3 className="mt-1.5 text-base font-semibold text-gray-900 dark:text-white">
              {step.title}
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
              {step.description}
            </p>
          </div>

          <div className="flex items-center justify-between px-5 pb-4">
            <div className="flex gap-2">
              {!isFirst && (
                <button
                  onClick={prev}
                  className="rounded-full px-4 py-2 text-sm font-medium text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Anterior
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={skip}
                className="rounded-full px-4 py-2 text-sm font-medium text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
              >
                Omitir
              </button>
              {isLast ? (
                <button
                  onClick={finish}
                  className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
                >
                  Finalizar
                </button>
              ) : (
                <button
                  onClick={next}
                  className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
                >
                  Siguiente
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-center gap-1.5 pb-3.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? "w-6 bg-emerald-600"
                    : "w-1.5 bg-gray-200 dark:bg-zinc-700"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </>
  )
}
