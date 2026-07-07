"use client"

import Link from "next/link"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CarouselLg } from "@/components/Carousel"
import { getIcon } from "@/components/premium/iconRegistry"

interface Stat {
  label: string
  value: number
  href: string
  icon: string
}

interface RecentStudent {
  id: number
  firstName: string
  lastName: string
  documentId: string
  grade: { name: string } | null
  section: { name: string } | null
}

interface RecentTeacher {
  id: number
  user: { name: string; email: string }
  speciality: string | null
}

interface CarouselImg {
  id: number
  url: string
  alt: string | null
}

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } },
}

const stagger = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

export default function AdminDashboard({
  stats,
  recentStudents,
  recentTeachers,
  totalStudents,
  totalTeachers,
  totalParents,
  totalCourses,
  institutionName,
  carouselImages,
}: {
  stats: Stat[]
  recentStudents: RecentStudent[]
  recentTeachers: RecentTeacher[]
  totalStudents: number
  totalTeachers: number
  totalParents: number
  totalCourses: number
  institutionName?: string
  carouselImages?: CarouselImg[]
}) {
  const quickLinks = [
    { label: "Alumnos", href: "/dashboard/admin/alumnos", icon: "users" },
    { label: "Profesores", href: "/dashboard/admin/profesores", icon: "school" },
    { label: "Padres", href: "/dashboard/admin/padres", icon: "users" },
    { label: "Cursos", href: "/dashboard/admin/cursos", icon: "book" },
    { label: "Grados", href: "/dashboard/admin/grados", icon: "layers" },
    { label: "Horarios", href: "/dashboard/admin/horarios", icon: "calendar" },
    { label: "Aulas", href: "/dashboard/admin/aulas", icon: "building" },
  ]

  const [showCarousel, setShowCarousel] = useState(false)
  const hasCarousel = (carouselImages ?? []).length > 0

  const totals = [
    { label: "Alumnos", value: totalStudents, icon: "users", href: "/dashboard/admin/alumnos" },
    { label: "Docentes", value: totalTeachers, icon: "school", href: "/dashboard/admin/profesores" },
    { label: "Padres", value: totalParents, icon: "users", href: "/dashboard/admin/padres" },
    { label: "Cursos", value: totalCourses, icon: "book", href: "/dashboard/admin/cursos" },
  ]

  return (
    <motion.div {...fadeUp} className="space-y-5 md:space-y-6 pt-3 md:pt-6" data-tour="dashboard">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="sa-eyebrow text-[var(--muted-foreground)]">{institutionName || "Institución"}</p>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--foreground)] font-[var(--font-display)]">
            Panel del Director
          </h1>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
          {getIcon("calendar", { size: 14 })}
          <span>{new Date().toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
        </div>
      </div>

      {/* Stats row */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={stagger}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
      >
        {stats.map((s) => (
          <motion.div key={s.label} variants={fadeUp}>
            <Link
              href={s.href}
              className="sa-surface sa-surface-hover block p-4 md:p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="sa-eyebrow text-[var(--muted-foreground)]">{s.label}</span>
                <div className="size-8 rounded-xl flex items-center justify-center bg-[var(--accent)]/10 text-[var(--accent)]">
                  {getIcon(s.icon, { size: 16 })}
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--foreground)]">
                {s.value}
              </p>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Carousel toggle */}
      {hasCarousel && (
        <motion.div variants={fadeUp} initial="initial" animate="animate">
          <button
            onClick={() => setShowCarousel(!showCarousel)}
            className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            {getIcon("eye", { size: 14 })}
            <span>Galería del colegio</span>
            <svg
              className={`size-3 transition-transform ${showCarousel ? "rotate-180" : ""}`}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <AnimatePresence>
            {showCarousel && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden mt-3"
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="sa-eyebrow text-[var(--muted-foreground)]">Tu colegio</h2>
                  <Link href="/dashboard/admin/perfil/carrusel" className="text-xs text-[var(--muted-foreground)] hover:text-[var(--accent)] transition-colors">
                    Editar
                  </Link>
                </div>
                <CarouselLg
                  images={carouselImages!}
                  autoPlay
                  intervalMs={6000}
                  aspectClass="aspect-[16/9] sm:aspect-[21/9]"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Quick links */}
      <motion.div variants={fadeUp} initial="initial" animate="animate">
        <div className="flex items-center gap-2 mb-3">
          <div className="size-1.5 rounded-full bg-[var(--accent)]" />
          <h2 className="sa-eyebrow text-[var(--muted-foreground)]">Acceso rápido</h2>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 md:gap-3">
          {quickLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="sa-surface sa-surface-hover flex flex-col items-center justify-center gap-1.5 p-3 md:p-4 min-h-[80px] md:min-h-[100px] text-center"
            >
              <div className="size-9 md:size-10 rounded-xl flex items-center justify-center bg-[var(--accent)]/10 text-[var(--accent)]">
                {getIcon(l.icon, { size: 18 })}
              </div>
              <span className="text-[11px] md:text-xs font-semibold text-[var(--foreground)] leading-tight">
                {l.label}
              </span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Recent activity */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={stagger}
        className="grid gap-5 md:gap-6 lg:grid-cols-2"
      >
        {/* Recent students */}
        <motion.div variants={fadeUp} className="sa-surface p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-[var(--accent)]" />
              <h2 className="sa-eyebrow text-[var(--muted-foreground)]">Últimos alumnos</h2>
            </div>
            <Link href="/dashboard/admin/alumnos" className="text-xs text-[var(--muted-foreground)] hover:text-[var(--accent)] transition-colors">
              Ver todos
            </Link>
          </div>
          {recentStudents.length === 0 ? (
            <div className="py-12 text-center">
              <div className="size-12 rounded-2xl mx-auto flex items-center justify-center bg-[var(--surface-3)] text-[var(--muted-foreground)] mb-3">
                {getIcon("users", { size: 20 })}
              </div>
              <p className="text-sm font-medium text-[var(--foreground)]">No hay alumnos registrados</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">Comienza registrando alumnos.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentStudents.map((s, idx) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.025, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl -mx-3 hover:bg-[var(--surface-2)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg flex items-center justify-center text-xs font-semibold bg-[var(--accent)]/10 text-[var(--accent)]">
                      {s.firstName.charAt(0)}{s.lastName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">{s.firstName} {s.lastName}</p>
                      <p className="text-[11px] text-[var(--muted-foreground)]">{s.documentId}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-[var(--muted-foreground)] bg-[var(--surface-3)] px-2.5 py-1 rounded-full">
                    {s.grade?.name ?? "—"} {s.section?.name ?? ""}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent teachers */}
        <motion.div variants={fadeUp} className="sa-surface p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-[var(--accent)]" />
              <h2 className="sa-eyebrow text-[var(--muted-foreground)]">Últimos docentes</h2>
            </div>
            <Link href="/dashboard/admin/profesores" className="text-xs text-[var(--muted-foreground)] hover:text-[var(--accent)] transition-colors">
              Ver todos
            </Link>
          </div>
          {recentTeachers.length === 0 ? (
            <div className="py-12 text-center">
              <div className="size-12 rounded-2xl mx-auto flex items-center justify-center bg-[var(--surface-3)] text-[var(--muted-foreground)] mb-3">
                {getIcon("school", { size: 20 })}
              </div>
              <p className="text-sm font-medium text-[var(--foreground)]">No hay docentes registrados</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">Registra docentes desde la sección correspondiente.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentTeachers.map((t, idx) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.025, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl -mx-3 hover:bg-[var(--surface-2)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg flex items-center justify-center text-xs font-semibold bg-[var(--accent)]/10 text-[var(--accent)]">
                      {t.user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">{t.user.name}</p>
                      <p className="text-[11px] text-[var(--muted-foreground)]">{t.user.email}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-[var(--muted-foreground)] bg-[var(--surface-3)] px-2.5 py-1 rounded-full">
                    {t.speciality ?? "Docente"}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
