import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

type Role = {
  id: string
  name: string
  image: string
}

const roles: Role[] = [
  { id: "dev", name: "Desarrollador", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80" },
  { id: "director", name: "Director", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80" },
  { id: "docente", name: "Docente", image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80" },
  { id: "padre", name: "Padre de Familia", image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80" },
  { id: "alumno", name: "Alumno", image: "https://images.unsplash.com/photo-1523050854058-8df90110c7f1?w=800&q=80" },
]

const roleMap: Record<string, Role> = Object.fromEntries(roles.map((r) => [r.id, r]))

export function generateStaticParams() {
  return roles.map((r) => ({ role: r.id }))
}

export function generateMetadata({ params }: { params: Promise<{ role: string }> }): Metadata {
  return {
    title: `${params.then(p => roleMap[p.role]?.name ?? "Rol")} — EduConecta`,
  }
}

export default async function RolPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params
  const r = roleMap[role]
  if (!r) notFound()

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-6xl mx-auto px-6 py-16 sm:py-24">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-8"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="m12 16-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Volver al inicio
        </Link>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
          <div className="w-full lg:w-[500px] shrink-0">
            <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-900">
              <img
                src={r.image}
                alt={r.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex-1 w-full flex flex-col items-center lg:items-start text-center lg:text-left">
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              {r.name}
            </p>
            <a
              href={`/api/download/${role}`}
              download
              className="inline-flex items-center gap-2 mt-6 btn-primary px-6 py-3 rounded-3xl text-sm font-medium transition cursor-pointer"
            >
              Descargar {r.name}
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 3v10m0 0-4-4m4 4 4-4M4 17h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
