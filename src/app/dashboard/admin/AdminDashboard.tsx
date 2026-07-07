"use client"

import Link from "next/link"
import { useState } from "react"
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
  const [showGallery, setShowGallery] = useState(false)
  const hasImages = (carouselImages ?? []).length > 0

  const quickLinks = [
    { label: "Alumnos", href: "/dashboard/admin/alumnos", icon: "users" },
    { label: "Profesores", href: "/dashboard/admin/profesores", icon: "school" },
    { label: "Padres", href: "/dashboard/admin/padres", icon: "users" },
    { label: "Cursos", href: "/dashboard/admin/cursos", icon: "book" },
    { label: "Grados", href: "/dashboard/admin/grados", icon: "layers" },
    { label: "Horarios", href: "/dashboard/admin/horarios", icon: "calendar" },
    { label: "Aulas", href: "/dashboard/admin/aulas", icon: "building" },
  ]

  return (
    <div className="space-y-5 md:space-y-6 pt-3 md:pt-6" data-tour="dashboard">
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
          <span>{new Date().toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" })}</span>
        </div>
      </div>

      {/* Gallery */}
      {hasImages && (
        <div>
          <button
            onClick={() => setShowGallery(!showGallery)}
            className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            {getIcon("eye", { size: 14 })}
            <span>Galería del colegio</span>
            <svg
              className={`size-3 transition-transform ${showGallery ? "rotate-180" : ""}`}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {showGallery && (
            <div className="mt-3">
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
            </div>
          )}
        </div>
      )}

      {/* Metric tiles */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="sa-surface sa-surface-hover block p-5 md:p-6"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="size-10 md:size-12 rounded-2xl flex items-center justify-center bg-[var(--accent)]/10 text-[var(--accent)]">
                {getIcon(s.icon, { size: 20 })}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] md:text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider truncate">
                  {s.label}
                </p>
                <p className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--foreground)] mt-0.5">
                  {s.value}
                </p>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--surface-3)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
                style={{ width: `${Math.min(100, (s.value / Math.max(1, stats[0]?.value || 1)) * 100)}%` }}
              />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 md:gap-3">
        {quickLinks.map((l) => (
          <Link
            key={l.label}
            href={l.href}
            className="sa-surface sa-surface-hover flex flex-col items-center justify-center gap-2 p-3 md:p-4 min-h-[80px] md:min-h-[90px] text-center"
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

      {/* Activity */}
      <div className="grid gap-4 md:gap-5 lg:grid-cols-2">
        {/* Students */}
        <div className="sa-surface p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
                {getIcon("users", { size: 16 })}
              </div>
              <span className="text-xs font-semibold text-[var(--foreground)]">Alumnos</span>
            </div>
            <Link href="/dashboard/admin/alumnos" className="text-[11px] text-[var(--muted-foreground)] hover:text-[var(--accent)] transition-colors">
              Ver todo
            </Link>
          </div>
          {recentStudents.length === 0 ? (
            <div className="py-10 text-center">
              <div className="size-10 rounded-xl mx-auto flex items-center justify-center bg-[var(--surface-3)] text-[var(--muted-foreground)] mb-2">
                {getIcon("users", { size: 18 })}
              </div>
              <p className="text-sm font-medium text-[var(--foreground)]">Sin alumnos</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Registra alumnos para verlos aquí.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentStudents.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between py-2 px-3 rounded-xl -mx-3 hover:bg-[var(--surface-2)] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="size-7 rounded-lg flex items-center justify-center text-[10px] font-semibold bg-[var(--accent)]/10 text-[var(--accent)] shrink-0">
                      {s.firstName.charAt(0)}{s.lastName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)] truncate">{s.firstName} {s.lastName}</p>
                      <p className="text-[11px] text-[var(--muted-foreground)]">{s.grade?.name ?? ""} {s.section?.name ?? ""}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-[var(--muted-foreground)] bg-[var(--surface-3)] px-2 py-1 rounded-full shrink-0 ml-2">
                    {s.documentId}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Teachers */}
        <div className="sa-surface p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
                {getIcon("school", { size: 16 })}
              </div>
              <span className="text-xs font-semibold text-[var(--foreground)]">Docentes</span>
            </div>
            <Link href="/dashboard/admin/profesores" className="text-[11px] text-[var(--muted-foreground)] hover:text-[var(--accent)] transition-colors">
              Ver todo
            </Link>
          </div>
          {recentTeachers.length === 0 ? (
            <div className="py-10 text-center">
              <div className="size-10 rounded-xl mx-auto flex items-center justify-center bg-[var(--surface-3)] text-[var(--muted-foreground)] mb-2">
                {getIcon("school", { size: 18 })}
              </div>
              <p className="text-sm font-medium text-[var(--foreground)]">Sin docentes</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Registra docentes para verlos aquí.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentTeachers.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between py-2 px-3 rounded-xl -mx-3 hover:bg-[var(--surface-2)] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="size-7 rounded-lg flex items-center justify-center text-[10px] font-semibold bg-[var(--accent)]/10 text-[var(--accent)] shrink-0">
                      {t.user.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)] truncate">{t.user.name}</p>
                      <p className="text-[11px] text-[var(--muted-foreground)] truncate">{t.user.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-[var(--muted-foreground)] bg-[var(--surface-3)] px-2 py-1 rounded-full shrink-0 ml-2">
                    {t.speciality ?? "Docente"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
