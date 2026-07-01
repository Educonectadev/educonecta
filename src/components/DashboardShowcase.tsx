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
    description: "Vista técnica con métricas de rendimiento, logs y estado del sistema.",
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
    description: "Tus cursos, tareas pendientes, horarios y calificaciones en un solo lugar.",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c7f1?w=800&q=80",
  },
]

export default function DashboardShowcase() {
  const [active, setActive] = useState(dashboards[0].id)
  const activeDashboard = dashboards.find((d) => d.id === active) ?? dashboards[0]

  return (
    <section className="max-w-6xl mx-auto px-6 py-16 sm:py-24">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
        {/* Tabs */}
        <div className="w-full lg:w-[380px] shrink-0 space-y-2">
          {dashboards.map((db) => {
            const isActive = active === db.id
            return (
              <button
                key={db.id}
                type="button"
                onClick={() => setActive(db.id)}
                className={`relative w-full text-left p-4 sm:p-5 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? "bg-emerald-50 dark:bg-emerald-950/30 shadow-sm"
                    : "hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-2xl border border-emerald-200 dark:border-emerald-800"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
                <div className="relative z-10">
                  <p
                    className={`text-xs font-semibold uppercase tracking-widest ${
                      isActive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-gray-400 dark:text-zinc-500"
                    }`}
                  >
                    {db.role}
                  </p>
                  <p
                    className={`mt-1 font-semibold ${
                      isActive
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-700 dark:text-zinc-300"
                    }`}
                  >
                    {db.title}
                  </p>
                  <p
                    className={`mt-1 text-sm leading-relaxed ${
                      isActive
                        ? "text-gray-600 dark:text-zinc-400"
                        : "text-gray-400 dark:text-zinc-500"
                    }`}
                  >
                    {db.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Image */}
        <div className="flex-1 w-full">
          <div className="relative w-full overflow-hidden rounded-2xl border border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-900">
            <div className="aspect-[16/10] w-full relative">
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
          </div>
        </div>
      </div>
    </section>
  )
}
