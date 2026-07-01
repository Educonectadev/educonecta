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

            <a
              href="/login"
              className="inline-flex items-center gap-2 mt-8 btn-primary px-6 py-3 rounded-3xl text-sm font-medium transition cursor-pointer"
            >
              Ingresar como {r.name}
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 3v10m0 0-4-4m4 4 4-4M4 17h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
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
