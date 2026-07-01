"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

type Dashboard = {
  id: string
  role: string
  title: string
  description: string
  image: string
}

const dashboards: Dashboard[] = [
  {
    id: "dev",
    role: "Desarrollador",
    title: "Panel de Desarrollo",
    description: "Métricas de rendimiento, logs y estado del sistema en tiempo real.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
  },
  {
    id: "admin",
    role: "Director",
    title: "Panel del Administrador",
    description: "Gestión institucional completa: usuarios, cursos, reportes y configuración general.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
  },
  {
    id: "teacher",
    role: "Docente",
    title: "Panel del Docente",
    description: "Registro de calificaciones, asistencia, tareas y comunicación con padres.",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
  },
  {
    id: "parent",
    role: "Padre de Familia",
    title: "Panel del Padre",
    description: "Seguimiento académico de tus hijos: notas, asistencia y comunicados.",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80",
  },
  {
    id: "student",
    role: "Alumno",
    title: "Panel del Alumno",
    description: "Cursos, tareas pendientes, horarios y calificaciones en un solo lugar.",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c7f1?w=800&q=80",
  },
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
  dev: { badge: "Desarrollador", cta: "Ver dashboard de desarrollo" },
  admin: { badge: "Director / Admin", cta: "Ver dashboard de administración" },
  teacher: { badge: "Docente", cta: "Ver dashboard docente" },
  parent: { badge: "Padre de Familia", cta: "Ver dashboard de padres" },
  student: { badge: "Alumno", cta: "Ver dashboard del alumno" },
}

export default function DashboardShowcase() {
  const [active, setActive] = useState(dashboards[0].id)
  const activeDashboard = dashboards.find((d) => d.id === active) ?? dashboards[0]
  const meta = roleMeta[activeDashboard.id]

  return (
    <section id="demos" className="max-w-6xl mx-auto px-6 py-16 sm:py-24 scroll-mt-24">
      <div className="text-center mb-12">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          Explora la plataforma
        </p>
        <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          Elige tu rol
        </h2>
        <p className="mt-3 text-gray-500 dark:text-zinc-400 max-w-xl mx-auto">
          Cada perfil tiene una vista única. Selecciona el tuyo y descubre cómo funciona EduConecta para ti.
        </p>
      </div>

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
                  {db.title}
                </h3>
                {isActive && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-zinc-400"
                    style={{ letterSpacing: "-0.04em" }}
                  >
                    {db.description}
                  </motion.p>
                )}
                {!isActive && (
                  <p
                    className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-zinc-400 truncate"
                    style={{ letterSpacing: "-0.04em" }}
                  >
                    {db.description}
                  </p>
                )}
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
                  alt={activeDashboard.title}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white/90 dark:from-zinc-900/90 to-transparent">
              <a
                href="/login"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all active:scale-95"
              >
                {meta.cta}
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="m5.685 14.164 8.122-8.333M5.685 5.83h8.122v8.334" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
