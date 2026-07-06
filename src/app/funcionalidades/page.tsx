import type { Metadata } from "next"
import Link from "next/link"
import IconClient from "@/components/IconClient"
import SiteFooter from "@/components/SiteFooter"
import LandingNav from "@/components/LandingNav"

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
      icon: "lucide:clipboard-check",
    },
    {
      title: "Calificaciones",
      description: "Evaluaciones configurables, promedios ponderados y boleta digital para padres.",
      icon: "lucide:star",
    },
    {
      title: "Tareas",
      description: "Publicación de tareas con fecha de vencimiento y notificación push automática.",
      icon: "lucide:file-text",
    },
    {
      title: "Horarios",
      description: "Horarios por curso, grado y sección con aulas y turnos (mañana/tarde).",
      icon: "lucide:calendar",
    },
    {
      title: "Comunicados",
      description: "Anuncios institucionales y por curso con acuse de recibo.",
      icon: "lucide:mail",
    },
    {
      title: "Disciplina",
      description: "Registro de incidencias con seguimiento y notificación a apoderados.",
      icon: "lucide:scale",
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
      icon: "lucide:bell",
    },
    {
      title: "Multi-sede",
      description: "Una sola cuenta para administrar varios campus o colegios de la misma red.",
      icon: "lucide:building-2",
    },
    {
      title: "Reportes y exportación",
      description: "Indicadores académicos y de asistencia exportables a Excel o PDF.",
      icon: "lucide:bar-chart-3",
    },
    {
      title: "Reportes para padres",
      description: "Vista semanal del desempeño y comportamiento de cada hijo.",
      icon: "lucide:eye",
    },
    {
      title: "Funciona con poco internet",
      description: "Interfaz optimizada para colegios en zonas con conexión limitada.",
      icon: "lucide:wifi-off",
    },
    {
      title: "Seguridad y cifrado",
      description: "Datos cifrados en reposo y en tránsito, con control de acceso por rol.",
      icon: "lucide:lock",
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
    <div className="min-h-screen flex flex-col bg-[var(--background)] overflow-x-hidden">
      <LandingNav />

      <main className="flex-1">
        <section className="border-b border-[var(--surface-border)]">
          <div className="max-w-4xl mx-auto px-6 pt-32 pb-20 md:pt-40 md:pb-28 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/8 text-[var(--accent)] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              <span className="text-xs font-semibold tracking-wide">Funcionalidades</span>
            </div>
            <h1 className="text-[2rem] sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.9] text-[var(--foreground)]">
              Todo lo que tu colegio necesita,
              <br />
              <span className="text-[var(--accent)]">en un solo lugar</span>
            </h1>
            <p className="mt-5 text-sm sm:text-base md:text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto leading-relaxed">
              Diseñado para instituciones, docentes, padres y estudiantes. Funciona en
              celular y computador, con o sin conexión estable.
            </p>
          </div>
        </section>

        <section>
          <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
            <div className="text-center max-w-2xl mx-auto mb-14 md:mb-20">
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-[var(--foreground)]">
                {mainModules.title}
              </h2>
              <p className="mt-4 text-[var(--muted-foreground)] text-sm sm:text-base md:text-lg">
                {mainModules.intro}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {mainModules.features.map((f, i) => (
                <FeatureCard key={f.title} feature={f} index={i} />
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--surface-border)] bg-[var(--surface-2)]">
          <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
            <div className="text-center max-w-2xl mx-auto mb-14 md:mb-20">
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-[var(--foreground)]">
                {technical.title}
              </h2>
              <p className="mt-4 text-[var(--muted-foreground)] text-sm sm:text-base md:text-lg">
                {technical.intro}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {technical.features.map((f, i) => (
                <FeatureCard key={f.title} feature={f} index={i} />
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--surface-border)]">
          <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
            <div className="text-center max-w-2xl mx-auto mb-14 md:mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/8 text-[var(--accent)] mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                <span className="text-xs font-semibold tracking-wide">Por tipo de usuario</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-[var(--foreground)]">
                Una experiencia pensada para cada rol
              </h2>
              <p className="mt-4 text-[var(--muted-foreground)] text-sm sm:text-base md:text-lg">
                Cada usuario entra a EduConecta con su propia cuenta y solo ve lo que le corresponde.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 md:gap-5">
              {roles.map((role) => (
                <RoleCard key={role.key} role={role} />
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--surface-border)] bg-[var(--surface-2)]">
          <div className="max-w-3xl mx-auto px-6 py-20 md:py-28 text-center">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--foreground)]">
              ¿Listo para empezar?
            </h2>
            <p className="mt-4 text-[var(--muted-foreground)] text-base md:text-lg">
              Déjanos tus datos y te contactamos en menos de 24 horas.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/planes" className="sa-btn sa-btn-primary text-base px-8 py-3">
                Ver planes
              </Link>
              <Link href="/contacto" className="sa-btn sa-btn-outline">
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

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  return (
    <div
      className="sa-surface sa-surface-hover p-6 md:p-8"
    >
      <div className="size-11 rounded-xl flex items-center justify-center bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/15">
        <IconClient icon={feature.icon} className="size-5" />
      </div>
      <h3 className="mt-5 text-base font-semibold text-[var(--foreground)]">
        {feature.title}
      </h3>
      <p className="mt-2 text-sm text-[var(--muted-foreground)] leading-relaxed">
        {feature.description}
      </p>
    </div>
  )
}

function RoleCard({ role }: { role: Role }) {
  return (
    <div className="sa-surface sa-surface-hover p-6 md:p-8">
      <h3 className="text-lg font-semibold text-[var(--foreground)]">{role.title}</h3>
      <p className="mt-1 text-sm text-[var(--accent)]">{role.tagline}</p>
      <ul className="mt-5 space-y-2.5">
        {role.bullets.map((b) => (
          <li key={b} className="flex items-start gap-2.5 text-sm text-[var(--muted-foreground)]">
            <svg className="size-4 shrink-0 mt-0.5 text-[var(--accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
