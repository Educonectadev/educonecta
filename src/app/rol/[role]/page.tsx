import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import SiteFooter from "@/components/SiteFooter"

type Role = {
  id: string
  name: string
  title: string
  description: string
  features: string[]
  image: string
}

const roles: Role[] = [
  {
    id: "dev",
    name: "Desarrollador",
    title: "Panel de Desarrollo",
    description: "Métricas de rendimiento, logs y estado del sistema en tiempo real.",
    features: [
      "Monitoreo de rendimiento del sistema",
      "Logs y trazabilidad de errores",
      "Estado de servicios y APIs",
      "Gestión de despliegues",
    ],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
  },
  {
    id: "director",
    name: "Director",
    title: "Panel del Administrador",
    description: "Gestión institucional completa: usuarios, cursos, reportes y configuración general.",
    features: [
      "Gestión de usuarios y roles",
      "Reportes académicos",
      "Configuración institucional",
      "Estadísticas generales",
    ],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
  },
  {
    id: "docente",
    name: "Docente",
    title: "Panel del Docente",
    description: "Registro de calificaciones, asistencia, tareas y comunicación con padres.",
    features: [
      "Registro de calificaciones",
      "Control de asistencia",
      "Asignación de tareas",
      "Comunicación con padres",
    ],
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
  },
  {
    id: "padre",
    name: "Padre de Familia",
    title: "Panel del Padre",
    description: "Seguimiento académico de tus hijos: notas, asistencia y comunicados.",
    features: [
      "Seguimiento de calificaciones",
      "Reporte de asistencia",
      "Comunicados y notificaciones",
      "Contacto con docentes",
    ],
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80",
  },
  {
    id: "alumno",
    name: "Alumno",
    title: "Panel del Alumno",
    description: "Cursos, tareas pendientes, horarios y calificaciones en un solo lugar.",
    features: [
      "Mis cursos y horarios",
      "Tareas pendientes",
      "Calificaciones",
      "Material de estudio",
    ],
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c7f1?w=800&q=80",
  },
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
    <div className="min-h-screen bg-white dark:bg-black flex flex-col">
      <div className="flex-1 max-w-6xl mx-auto px-6 py-16 sm:py-24 w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-8"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="m12 16-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Volver al inicio
        </Link>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
          <div className="flex-1 w-full">
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              {r.name}
            </p>
            <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
              {r.title}
            </h1>
            <p className="mt-4 text-lg text-gray-500 dark:text-zinc-400 max-w-lg">
              {r.description}
            </p>

            <ul className="mt-8 space-y-3">
              {r.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-gray-700 dark:text-zinc-300">
                  <svg className="size-5 shrink-0 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            <p className="mt-8 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-zinc-400">
              Descargar para
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={`/api/download/${role}?platform=win`} download className="sa-btn sa-btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l7.5.7v6.8H4z"/><path d="M4 20l7.5-.7v-6.8H4z"/><path d="M12.5 3.5L20 4v7h-7.5z"/><path d="M12.5 20.5L20 20v-7h-7.5z"/></svg>
                Windows
              </a>
              <a href={`/api/download/${role}?platform=linux`} download className="sa-btn sa-btn-outline inline-flex items-center gap-2 px-5 py-2.5 text-xs">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3L9 7m3-4l3 4m-3-4v4M6 11l3-1m-3 1l-3 4m3-4h12m0 0l3 4m-3-4l-3-1"/><path d="M6 11l3 5h6l3-5"/><path d="M12 16v2"/></svg>
                Linux (.deb)
              </a>
              <a href={`/api/download/${role}?platform=mac`} download className="sa-btn sa-btn-outline inline-flex items-center gap-2 px-5 py-2.5 text-xs">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/></svg>
                macOS
              </a>
              <a href={`/api/download/${role}?platform=android`} download className="sa-btn sa-btn-outline inline-flex items-center gap-2 px-5 py-2.5 text-xs">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="9" y1="6" x2="15" y2="6"/></svg>
                Android
              </a>
            </div>
          </div>

          <div className="w-full lg:w-[500px] shrink-0">
            <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-900">
              <img
                src={r.image}
                alt={r.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
