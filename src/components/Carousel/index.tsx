"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export interface CarouselImage {
  id: number | string
  url: string
  alt?: string | null
}

interface Props {
  images: CarouselImage[]
  autoPlay?: boolean
  intervalMs?: number
  className?: string
  aspectClass?: string
  rounded?: string
}

export default function Carousel({
  images,
  autoPlay = false,
  intervalMs = 5000,
  className = "",
  aspectClass = "aspect-[16/9]",
  rounded = "rounded-2xl",
}: Props) {
  const [index, setIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const total = images.length
  const trackRef = useRef<HTMLDivElement | null>(null)

  const go = useCallback(
    (next: number) => {
      if (total === 0) return
      const i = ((next % total) + total) % total
      setIndex(i)
    },
    [total]
  )

  const next = useCallback(() => go(index + 1), [go, index])
  const prev = useCallback(() => go(index - 1), [go, index])

  useEffect(() => {
    if (!autoPlay || isPaused || total <= 1) return
    const t = setInterval(() => setIndex((i) => (i + 1) % total), intervalMs)
    return () => clearInterval(t)
  }, [autoPlay, isPaused, total, intervalMs])

  // Soporte de swipe en mobile.
  const touchStart = useRef<number | null>(null)
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0]?.clientX ?? null
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current == null) return
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStart.current
    if (Math.abs(dx) > 40) {
      if (dx < 0) next()
      else prev()
    }
    touchStart.current = null
  }

  // Soporte de teclado.
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev()
      if (e.key === "ArrowRight") next()
    }
    el.addEventListener("keydown", handler)
    return () => el.removeEventListener("keydown", handler)
  }, [next, prev])

  if (total === 0) {
    return (
      <div
        className={`w-full ${aspectClass} ${rounded} bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-xs text-gray-400 dark:text-zinc-500 border border-dashed border-gray-200 dark:border-zinc-700 ${className}`}
      >
        Aún no hay imágenes en el carrusel.
      </div>
    )
  }

  return (
    <div
      ref={trackRef}
      tabIndex={0}
      role="region"
      aria-label="Carrusel de imágenes"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className={`relative w-full ${aspectClass} ${rounded} overflow-hidden bg-gray-100 dark:bg-zinc-800 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${className}`}
    >
      <div
        className="absolute inset-0 flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((img, i) => (
          <div key={img.id} className="relative w-full h-full shrink-0 grow-0 basis-full">
            <img
              src={img.url}
              alt={img.alt ?? `Imagen ${i + 1}`}
              className="absolute inset-0 size-full object-cover"
              draggable={false}
              loading={i === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Anterior"
            className="absolute top-1/2 left-2 sm:left-4 z-10 -translate-y-1/2 inline-flex items-center justify-center size-9 sm:size-11 rounded-full bg-white/90 dark:bg-zinc-900/80 backdrop-blur text-gray-800 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-800 shadow-sm transition-colors duration-200"
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Siguiente"
            className="absolute top-1/2 right-2 sm:right-4 z-10 -translate-y-1/2 inline-flex items-center justify-center size-9 sm:size-11 rounded-full bg-white/90 dark:bg-zinc-900/80 backdrop-blur text-gray-800 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-800 shadow-sm transition-colors duration-200"
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/30 dark:bg-black/50 px-2.5 py-1.5 backdrop-blur-sm">
            {images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Ir a imagen ${i + 1}`}
                className={
                  "size-1.5 sm:size-2 rounded-full transition-all duration-200 " +
                  (i === index ? "bg-white w-4 sm:w-5" : "bg-white/50 hover:bg-white/80")
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}