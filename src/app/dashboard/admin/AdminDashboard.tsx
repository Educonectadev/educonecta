"use client"

import Link from "next/link"
import { useState } from "react"
import { getIcon } from "@/components/premium/iconRegistry"

interface Stat {
  label: string
  value: number
  href: string
  icon: string
}

interface CarouselImg {
  id: number
  url: string
  alt: string | null
}

function StatCard({ stat, max }: { stat: Stat; max: number }) {
  return (
    <Link
      href={stat.href}
      className="block bg-[var(--surface)] border border-[var(--surface-border)] rounded-2xl p-4"
    >
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl flex items-center justify-center bg-[var(--accent)]/10 text-[var(--accent)] shrink-0">
          {getIcon(stat.icon, { size: 20 })}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-[var(--muted-foreground)] uppercase tracking-wider truncate">
            {stat.label}
          </p>
          <p className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            {stat.value}
          </p>
        </div>
      </div>
      <div className="mt-3 h-1 rounded-full bg-[var(--surface-3)]">
        <div
          className="h-full rounded-full bg-[var(--accent)]"
          style={{ width: `${max > 0 ? (stat.value / max) * 100 : 0}%` }}
        />
      </div>
    </Link>
  )
}

export default function AdminDashboard({
  stats,
  institutionName,
  carouselImages,
}: {
  stats: Stat[]
  institutionName?: string
  carouselImages?: CarouselImg[]
}) {
  const [showGallery, setShowGallery] = useState(false)
  const hasImages = (carouselImages ?? []).length > 0
  const maxStat = Math.max(1, ...stats.map((s) => s.value))

  return (
    <div className="space-y-4 py-4" data-tour="dashboard">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--muted-foreground)] truncate">
            {institutionName || "Institución"}
          </p>
          <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
            Panel del Director
          </h1>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-[var(--muted-foreground)] shrink-0">
          {getIcon("calendar", { size: 14 })}
          <span className="whitespace-nowrap">{new Date().toLocaleDateString("es-PE", { day: "numeric", month: "long" })}</span>
        </div>
      </div>

      {/* Gallery toggle */}
      {hasImages && (
        <div>
          <button
            onClick={() => setShowGallery(!showGallery)}
            className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]"
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
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                  Tu colegio
                </span>
                <Link href="/dashboard/admin/perfil/carrusel" className="text-xs text-[var(--muted-foreground)]">
                  Editar
                </Link>
              </div>
              <div className="rounded-2xl overflow-hidden bg-[var(--surface-3)]">
                <div className="relative w-full aspect-[16/9]">
                  <img
                    src={carouselImages![0].url}
                    alt={carouselImages![0].alt ?? "Colegio"}
                    className="size-full object-cover"
                  />
                </div>
                {carouselImages!.length > 1 && (
                  <div className="flex gap-1.5 justify-center py-2 bg-[var(--surface)]">
                    {carouselImages!.map((_, i) => (
                      <div key={i} className={`size-1.5 rounded-full ${i === 0 ? "bg-[var(--accent)] w-4" : "bg-[var(--surface-3)]"}`} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Metric stats */}
      <div className="grid grid-cols-2 gap-2">
        {stats.map((s) => (
          <StatCard key={s.label} stat={s} max={maxStat} />
        ))}
      </div>
    </div>
  )
}
