"use client"

import Link from "next/link"
import { useState } from "react"
import { motion } from "framer-motion"
import { CarouselLg } from "@/components/Carousel"
import { StarsBackground } from "@/components/animate-ui/components/backgrounds/stars"
import { useTheme } from "@/components/ThemeProvider"
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } },
}

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
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
    { label: "Alumnos", href: "/dashboard/admin/alumnos", count: totalStudents, icon: "users" },
    { label: "Profesores", href: "/dashboard/admin/profesores", count: totalTeachers, icon: "school" },
    { label: "Padres", href: "/dashboard/admin/padres", count: totalParents, icon: "diversity_3" },
    { label: "Cursos", href: "/dashboard/admin/cursos", count: totalCourses, icon: "book" },
    { label: "Grados", href: "/dashboard/admin/grados", count: null, icon: "layers" },
    { label: "Horarios", href: "/dashboard/admin/horarios", count: null, icon: "calendar" },
    { label: "Aulas", href: "/dashboard/admin/aulas", count: null, icon: "building" },
  ]

  const teachers = recentTeachers.slice(0, 6)
  const [teacherIdx, setTeacherIdx] = useState(0)

  const { theme } = useTheme()
  const starColor = theme === "dark" ? "#ffffff" : "#000000"

  return (
    <motion.div {...fadeUp} className="space-y-5 md:space-y-6 pt-3 md:pt-6" data-tour="dashboard">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-100 via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 min-h-[200px] sm:min-h-[240px] flex items-end">
        <StarsBackground className="absolute inset-0" starColor={starColor} pointerEvents={false} />
        <div className="relative z-10 w-full p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--surface-2)", backdropFilter: "blur(8px)" }}>
              {getIcon("school", { size: 20, style: { color: "var(--muted-foreground)" } })}
            </div>
            <span className="sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>{institutionName || "Institución"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Bienvenido</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>Panel de Administración</p>
        </div>
      </div>

      {/* Carrusel del colegio */}
      {(carouselImages ?? []).length > 0 && (
        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {getIcon("eye", { size: 16, style: { color: "var(--muted-foreground)" } })}
              <h2 className="sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>Tu colegio</h2>
            </div>
            <Link
              href="/dashboard/admin/perfil/carrusel"
              className="text-xs" style={{ color: "var(--muted-foreground)" }}
            >
              Editar imágenes →
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

      {/* Stats */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {stats.map((s) => (
          <motion.div key={s.label} variants={itemVariants}>
            <Link
              href={s.href}
              className="sa-tile block"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="sa-eyebrow">{s.label}</span>
                {getIcon(s.icon, { size: 18, className: "opacity-50" })}
              </div>
              <p className="sa-num text-3xl">{s.value}</p>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Teacher carousel */}
      {teachers.length > 0 && (
        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {getIcon("users", { size: 16, style: { color: "var(--muted-foreground)" } })}
              <h2 className="sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>Nuestros Docentes</h2>
            </div>
            <div className="flex gap-1">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setTeacherIdx(Math.max(0, teacherIdx - 1))}
                disabled={teacherIdx === 0}
                className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-30 transition-all"
                style={{ background: "var(--surface-2)", border: "1px solid var(--surface-border)" }}
              >
                {getIcon("arrow_left", { size: 14, style: { color: "var(--muted-foreground)" } })}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setTeacherIdx(Math.min(teachers.length - 3, teacherIdx + 1))}
                disabled={teacherIdx >= teachers.length - 3}
                className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-30 transition-all"
                style={{ background: "var(--surface-2)", border: "1px solid var(--surface-border)" }}
              >
                {getIcon("arrow_right", { size: 14, style: { color: "var(--muted-foreground)" } })}
              </motion.button>
            </div>
          </div>
          <div className="overflow-hidden rounded-[var(--radius-card)]">
            <div className="flex gap-3 transition-transform duration-300" style={{ transform: `translateX(-${teacherIdx * (160 + 12)}px)` }}>
              {teachers.map((t) => (
                <motion.div
                  key={t.id}
                  whileHover={{ y: -2 }}
                  className="shrink-0 w-[160px] sa-surface"
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-semibold mx-auto mb-3" style={{ background: "var(--surface-3)", color: "var(--muted-foreground)" }}>
                    {t.user.name.charAt(0)}
                  </div>
                  <p className="text-sm font-semibold text-center truncate" style={{ color: "var(--foreground)" }}>{t.user.name}</p>
                  <p className="text-[11px] text-center truncate" style={{ color: "var(--muted-foreground)" }}>{t.speciality || "Docente"}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick links */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible">
        <div className="flex items-center gap-2 mb-4">
          {getIcon("grid", { size: 16, style: { color: "var(--muted-foreground)" } })}
          <h2 className="sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>Acceso rápido</h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {quickLinks.map((l) => (
            <motion.div key={l.label} variants={itemVariants}>
              <Link
                href={l.href}
                className="sa-surface flex flex-col items-center justify-center gap-2 p-4 min-h-[100px] text-center sa-surface-hover"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--surface-2)" }}>
                  {getIcon(l.icon, { size: 20, style: { color: "var(--muted-foreground)" } })}
                </div>
                <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>{l.label}</span>
                {l.count !== null && <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{l.count} registrados</span>}
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="grid gap-6 lg:grid-cols-2"
      >
        <motion.div variants={itemVariants} className="sa-surface p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              {getIcon("users", { size: 16, style: { color: "var(--muted-foreground)" } })}
              <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Últimos Alumnos</h2>
            </div>
            <Link href="/dashboard/admin/alumnos" className="text-xs" style={{ color: "var(--muted-foreground)" }}>Ver todos</Link>
          </div>
          {recentStudents.length === 0 ? (
            <div className="sa-surface py-14 md:py-16 text-center" style={{ border: "none", boxShadow: "none", background: "transparent" }}>
              <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
                {getIcon("users", { size: 24, style: { color: "var(--muted-foreground)" } })}
              </div>
              <p className="text-sm font-medium mt-3" style={{ color: "var(--foreground)" }}>No hay alumnos registrados</p>
              <p className="text-xs max-w-xs mx-auto mt-1" style={{ color: "var(--muted-foreground)" }}>Comienza registrando alumnos desde la sección de alumnos.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentStudents.map((s, idx) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.025, ease: [0.16, 1, 0.3, 1] as const }}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl -mx-3"
                  style={{ transition: "background 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium" style={{ background: "var(--surface-3)", color: "var(--muted-foreground)" }}>
                      {s.firstName.charAt(0)}{s.lastName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{s.firstName} {s.lastName}</p>
                      <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>{s.documentId}</p>
                    </div>
                  </div>
                  <span className="sa-chip text-[11px]" style={{ color: "var(--muted-foreground)", background: "var(--surface-3)" }}>{s.grade?.name ?? "—"} {s.section?.name ?? ""}</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="sa-surface p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              {getIcon("school", { size: 16, style: { color: "var(--muted-foreground)" } })}
              <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Últimos Profesores</h2>
            </div>
            <Link href="/dashboard/admin/profesores" className="text-xs" style={{ color: "var(--muted-foreground)" }}>Ver todos</Link>
          </div>
          {recentTeachers.length === 0 ? (
            <div className="sa-surface py-14 md:py-16 text-center" style={{ border: "none", boxShadow: "none", background: "transparent" }}>
              <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
                {getIcon("school", { size: 24, style: { color: "var(--muted-foreground)" } })}
              </div>
              <p className="text-sm font-medium mt-3" style={{ color: "var(--foreground)" }}>No hay profesores registrados</p>
              <p className="text-xs max-w-xs mx-auto mt-1" style={{ color: "var(--muted-foreground)" }}>Contrata profesores desde la sección de profesores.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentTeachers.map((t, idx) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.025, ease: [0.16, 1, 0.3, 1] as const }}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl -mx-3"
                  style={{ transition: "background 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium" style={{ background: "var(--surface-3)", color: "var(--muted-foreground)" }}>
                      {t.user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{t.user.name}</p>
                      <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>{t.user.email}</p>
                    </div>
                  </div>
                  <span className="sa-chip text-[11px]" style={{ color: "var(--muted-foreground)", background: "var(--surface-3)" }}>{t.speciality ?? "—"}</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
