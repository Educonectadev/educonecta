"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

type Dashboard = {
  id: string
  role: string
  image: string
}

const dashboards: Dashboard[] = [
  { id: "dev", role: "Desarrollador", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80" },
  { id: "admin", role: "Director", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80" },
  { id: "teacher", role: "Docente", image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80" },
  { id: "parent", role: "Padre de Familia", image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80" },
  { id: "student", role: "Alumno", image: "https://images.unsplash.com/photo-1523050854058-8df90110c7f1?w=800&q=80" },
]

function CornerSVG({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6.018 19.789C4.705 20 3.137 20 0 20H20V0C20 3.137 20 4.705 19.789 6.018C18.65 13.098 13.098 18.65 6.018 19.789Z"
        fill="currentColor"
      />
    </svg>
  )
}

function CornerSVGBottom({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6.018 0.211C4.705 0 3.137 0 0 0H20V20C20 16.863 20 15.295 19.789 13.982C18.65 6.902 13.098 1.35 6.018 0.211Z"
        fill="currentColor"
      />
    </svg>
  )
}

const roleMeta: Record<string, { badge: string; cta: string }> = {
  dev: { badge: "Desarrollador", cta: "Descargar Dev" },
  admin: { badge: "Director / Admin", cta: "Descargar Director" },
  teacher: { badge: "Docente", cta: "Descargar Docente" },
  parent: { badge: "Padre de Familia", cta: "Descargar Padre" },
  student: { badge: "Alumno", cta: "Descargar Alumno" },
}

export default function DashboardShowcase() {
  const [active, setActive] = useState(dashboards[0].id)
  const activeDashboard = dashboards.find((d) => d.id === active) ?? dashboards[0]
  const meta = roleMeta[activeDashboard.id]

  return (
    <section id="demos" className="max-w-6xl mx-auto px-6 py-16 sm:py-24 scroll-mt-24">
      <div className="flex flex-col lg:flex-row gap-0 items-stretch">
        {/* Tabs panel */}
        <div className="w-full lg:w-auto shrink-0 flex flex-col justify-center gap-0 py-10 lg:pr-0">
          {dashboards.map((db) => {
            const isActive = active === db.id
            const m = roleMeta[db.id]
            return (
              <button
                key={db.id}
                type="button"
                onMouseEnter={() => setActive(db.id)}
                className={`relative w-full lg:w-[300px] text-left px-5 py-[18px] transition-colors duration-200 ${
                  isActive ? "bg-slate-200 dark:bg-zinc-700" : "bg-transparent hover:bg-slate-100 dark:hover:bg-zinc-800/50"
                }`}
                style={{
                  borderRadius: isActive
                    ? "12px 0 0 12px"
                    : "12px 0 0 12px",
                }}
              >
                {/* Top corner decoration */}
                <div
                  className={`absolute -top-5 right-0 size-5 transition-opacity duration-200 ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <CornerSVG className="size-5 text-slate-200 dark:text-zinc-700" />
                </div>

                {/* Bottom corner decoration */}
                <div
                  className={`absolute -bottom-5 right-0 size-5 transition-opacity duration-200 ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <CornerSVGBottom className="size-5 text-slate-200 dark:text-zinc-700" />
                </div>

                {/* Right edge filler for selected state */}
                <div
                  className={`absolute top-0 right-0 w-5 h-full bg-slate-200 dark:bg-zinc-700 transition-opacity duration-200 ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                />

                <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  {m.badge}
                </p>
                <h3
                  className="mt-1 text-xl font-semibold tracking-tight text-gray-900 dark:text-white"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  {db.role}
                </h3>
              </button>
            )
          })}
        </div>

        {/* Image panel */}
        <div className="flex-1 w-full">
          <div className="relative w-full h-full overflow-hidden rounded-2xl border border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-900">
            <div className="aspect-[16/10] lg:aspect-auto lg:h-full w-full relative min-h-[300px]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeDashboard.id}
                  src={activeDashboard.image}
                  alt={activeDashboard.role}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-white/90 dark:from-zinc-900/90 to-transparent">
              <div className="flex flex-wrap gap-1.5">
                <a href={`/api/download/${activeDashboard.id}?platform=win`} download className="btn-primary px-3.5 py-2 rounded-2xl text-[11px] font-medium inline-flex items-center gap-1.5 transition cursor-pointer">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l7.5.7v6.8H4z"/><path d="M4 20l7.5-.7v-6.8H4z"/><path d="M12.5 3.5L20 4v7h-7.5z"/><path d="M12.5 20.5L20 20v-7h-7.5z"/></svg>
                  Windows
                </a>
                <a href={`/api/download/${activeDashboard.id}?platform=linux`} download className="border border-white/30 hover:border-white/60 text-white/80 hover:text-white px-3.5 py-2 rounded-2xl text-[11px] font-medium inline-flex items-center gap-1.5 transition cursor-pointer">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3L9 7m3-4l3 4m-3-4v4M6 11l3-1m-3 1l-3 4m3-4h12m0 0l3 4m-3-4l-3-1"/><path d="M6 11l3 5h6l3-5"/><path d="M12 16v2"/></svg>
                  Linux
                </a>
                <a href={`/api/download/${activeDashboard.id}?platform=mac`} download className="border border-white/30 hover:border-white/60 text-white/80 hover:text-white px-3.5 py-2 rounded-2xl text-[11px] font-medium inline-flex items-center gap-1.5 transition cursor-pointer">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/></svg>
                  macOS
                </a>
                <a href={`/api/download/${activeDashboard.id}?platform=android`} download className="border border-white/30 hover:border-white/60 text-white/80 hover:text-white px-3.5 py-2 rounded-2xl text-[11px] font-medium inline-flex items-center gap-1.5 transition cursor-pointer">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="9" y1="6" x2="15" y2="6"/></svg>
                  Android
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
