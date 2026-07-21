export type InstallRoleConfig = {
  slug: string
  dashboardRole: string
  name: string
  title: string
  description: string
  features: string[]
}

export const installRoles: InstallRoleConfig[] = [
  {
    slug: "developer",
    dashboardRole: "SUPER_ADMIN",
    name: "Desarrollador",
    title: "Panel de Desarrollo",
    description: "Métricas de rendimiento, logs y estado del sistema en tiempo real.",
    features: [
      "Monitoreo de rendimiento del sistema",
      "Logs y trazabilidad de errores",
      "Estado de servicios y APIs",
      "Gestión de despliegues",
    ],
  },
  {
    slug: "super-admin",
    dashboardRole: "SUPER_ADMIN",
    name: "Super Admin",
    title: "Panel de Super Administración",
    description: "Gestión global de instituciones, usuarios y configuración del sistema.",
    features: [
      "Gestión de instituciones educativas",
      "Administración de usuarios y roles",
      "Configuración global del sistema",
      "Reportes y estadísticas generales",
    ],
  },
  {
    slug: "director",
    dashboardRole: "INSTITUTIONAL_ADMIN",
    name: "Director",
    title: "Panel del Administrador",
    description: "Gestión institucional completa: usuarios, cursos, reportes y configuración general.",
    features: [
      "Gestión de usuarios y roles",
      "Reportes académicos",
      "Configuración institucional",
      "Estadísticas generales",
    ],
  },
  {
    slug: "docente",
    dashboardRole: "TEACHER",
    name: "Docente",
    title: "Panel del Docente",
    description: "Registro de calificaciones, asistencia, tareas y comunicación con padres.",
    features: [
      "Registro de calificaciones",
      "Control de asistencia",
      "Asignación de tareas",
      "Comunicación con padres",
    ],
  },
  {
    slug: "padres",
    dashboardRole: "PARENT",
    name: "Padre de Familia",
    title: "Panel del Padre",
    description: "Seguimiento académico de tus hijos: notas, asistencia y comunicados.",
    features: [
      "Seguimiento de calificaciones",
      "Reporte de asistencia",
      "Comunicados y notificaciones",
      "Contacto con docentes",
    ],
  },
  {
    slug: "alumnos",
    dashboardRole: "STUDENT",
    name: "Alumno",
    title: "Panel del Alumno",
    description: "Cursos, tareas pendientes, horarios y calificaciones en un solo lugar.",
    features: [
      "Mis cursos y horarios",
      "Tareas pendientes",
      "Calificaciones",
      "Material de estudio",
    ],
  },
  {
    slug: "secretary",
    dashboardRole: "SECRETARY",
    name: "Secretaria",
    title: "Panel de Secretaria",
    description: "Gestión operativa de la institución: matrícula, alumnos, profesores y reportes.",
    features: [
      "Gestión de alumnos y padres",
      "Matrícula y calificaciones",
      "Horarios y aulas",
      "Carga masiva de datos",
    ],
  },
]

export function getInstallRoleBySlug(slug: string): InstallRoleConfig | undefined {
  return installRoles.find((r) => r.slug === slug)
}
