import type { Metadata } from "next"
import Link from "next/link"
import SiteFooter from "@/components/SiteFooter"

export const metadata: Metadata = {
  title: "Funcionalidades — EduConecta",
  description:
    "Todo lo que EduConecta ofrece a instituciones, docentes, padres y estudiantes.",
}

interface Feature {
  title: string
  description: string
  icon: string
}

interface FeatureGroup {
  title: string
  intro: string
  features: Feature[]
}

interface Role {
  key: string
  title: string
  tagline: string
  bullets: string[]
}

const mainModules: FeatureGroup = {
  title: "Módulos principales",
  intro: "El día a día del colegio, conectado de extremo a extremo.",
  features: [
    {
      title: "Asistencia",
      description: "Registro rápido por docente, alertas automáticas a padres y reportes exportables.",
      icon: "fact_check",
    },
    {
      title: "Calificaciones",
      description: "Evaluaciones configurables, promedios ponderados y boleta digital para padres.",
      icon: "grade",
    },
    {
      title: "Tareas",
      description: "Publicación de tareas con fecha de vencimiento y notificación push automática.",
      icon: "assignment",
    },
    {
      title: "Horarios",
      description: "Horarios por curso, grado y sección con aulas y turnos (mañana/tarde).",
      icon: "calendar_month",
    },
    {
      title: "Comunicados",
      description: "Anuncios institucionales y por curso con acuse de recibo.",
      icon: "mail",
    },
    {
      title: "Disciplina",
      description: "Registro de incidencias con seguimiento y notificación a apoderados.",
      icon: "gavel",
    },
  ],
}

const technical: FeatureGroup = {
  title: "Características técnicas",
  intro: "Construido para operar sin sobresaltos, incluso en redes con poca señal.",
  features: [
    {
      title: "Notificaciones push",
      description: "Alertas instantáneas en el celular de los padres, incluso con la app cerrada.",
      icon: "notifications_active",
    },
    {
      title: "Multi-sede",
      description: "Una sola cuenta para administrar varios campus o colegios de la misma red.",
      icon: "apartment",
    },
    {
      title: "Reportes y exportación",
      description: "Indicadores académicos y de asistencia exportables a Excel o PDF.",
      icon: "analytics",
    },
    {
      title: "Reportes para padres",
      description: "Vista semanal del desempeño y comportamiento de cada hijo.",
      icon: "visibility",
    },
    {
      title: "Funciona con poco internet",
      description: "Interfaz optimizada para colegios en zonas con conexión limitada.",
      icon: "wifi_off",
    },
    {
      title: "Seguridad y cifrado",
      description: "Datos cifrados en reposo y en tránsito, con control de acceso por rol.",
      icon: "lock",
    },
  ],
}

const roles: Role[] = [
  {
    key: "institucion",
    title: "Instituciones",
    tagline: "Una sola plataforma para dirigir tu colegio.",
    bullets: [
      "Administra docentes, estudiantes, grados y secciones desde un panel central.",
      "Visualiza indicadores de asistencia y rendimiento por sede, grado o curso.",
      "Configura planes, aportes y activa módulos según tu comunidad educativa.",
      "Recibe reportes automáticos semanales sin armar excels a mano.",
    ],
  },
  {
    key: "docente",
    title: "Docentes",
    tagline: "Menos papeleo, más clase.",
    bullets: [
      "Toma asistencia desde el celular en menos de 30 segundos.",
      "Registra calificaciones y tareas con plantillas reutilizables.",
      "Publica comunicados a los padres de cada curso con un solo toque.",
      "Consulta su horario actualizado en tiempo real.",
    ],
  },
  {
    key: "padres",
    title: "Padres y madres",
    tagline: "Acompañamiento en tiempo real.",
    bullets: [
      "Recibe notificaciones push cada vez que hay una tarea, nota o inasistencia.",
      "Revisa calificaciones, asistencia y reportes de sus hijos.",
      "Comunícate directamente con el docente desde la app.",
      "Descarga boletas y constancias en PDF.",
    ],
  },
  {
    key: "estudiantes",
    title: "Estudiantes",
    tagline: "Toda su vida académica en el bolsillo.",
    bullets: [
      "Ve sus cursos, horarios y tareas pendientes desde su cuenta.",
      "Recibe avisos de evaluaciones y fechas importantes.",
      "Consulta sus calificaciones y descarga constancias.",
      "Accede desde celular o computador con la misma experiencia.",
    ],
  },
]

export default function FuncionalidadesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black">
      <header className="border-b border-gray-100 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight text-gray-900 dark:text-white/90">
            EduConecta
          </Link>
          <div className="flex items-center gap-5">
            <Link
              href="/contacto"
              className="text-sm font-medium text-gray-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200"
            >
              Contacto
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-gray-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-4xl mx-auto px-6 pt-16 pb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Funcionalidades
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white/90">
            Todo lo que tu colegio necesita, en un solo lugar
          </h1>
          <p className="mt-4 text-base text-gray-500 dark:text-zinc-400 max-w-2xl mx-auto">
            Diseñado para instituciones, docentes, padres y estudiantes. Funciona en
            celular y computador, con o sin conexión estable.
          </p>
        </section>

        <FeatureSection group={mainModules} />

        <FeatureSection group={technical} alt />

        <section className="max-w-6xl mx-auto px-6 py-16 border-t border-gray-100 dark:border-zinc-800">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Por tipo de usuario
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white/90">
              Una experiencia pensada para cada rol
            </h2>
            <p className="mt-3 text-sm text-gray-500 dark:text-zinc-400">
              Cada usuario entra a EduConecta con su propia cuenta y solo ve lo que le corresponde.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
            {roles.map((role) => (
              <RoleCard key={role.key} role={role} />
            ))}
          </div>
        </section>

        <section className="border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/30">
          <div className="max-w-3xl mx-auto px-6 py-16 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90">
              ¿Listo para empezar?
            </h2>
            <p className="mt-3 text-sm text-gray-500 dark:text-zinc-400">
              Déjanos tus datos y te contactamos en menos de 24 horas.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/planes"
                className="rounded-[30px] border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-800 hover:border-emerald-300 hover:text-emerald-600 transition-colors duration-200"
              >
                Ver planes
              </Link>
              <Link
                href="/contacto"
                className="rounded-[30px] bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-700 transition-colors duration-200"
              >
                Contactar al equipo
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

function FeatureSection({ group, alt }: { group: FeatureGroup; alt?: boolean }) {
  return (
    <section className={"max-w-6xl mx-auto px-6 py-16 " + (alt ? "border-t border-gray-100 dark:border-zinc-800" : "")}>
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          {group.title}
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white/90">
          {group.title}
        </h2>
        <p className="mt-3 text-sm text-gray-500 dark:text-zinc-400">{group.intro}</p>
      </div>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {group.features.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-800 p-6 transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-700"
          >
            <div className="inline-flex size-11 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
              <span className="material-icons text-xl">{f.icon}</span>
            </div>
            <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white/90">{f.title}</h3>
            <p className="mt-1.5 text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function RoleCard({ role }: { role: Role }) {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-800 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90">{role.title}</h3>
      <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">{role.tagline}</p>
      <ul className="mt-4 space-y-2">
        {role.bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-sm text-gray-600 dark:text-zinc-300">
            <svg aria-hidden className="size-4 shrink-0 mt-0.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}