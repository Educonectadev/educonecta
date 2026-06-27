import type { Metadata } from "next"
import Link from "next/link"
import SiteFooter from "@/components/SiteFooter"

export const metadata: Metadata = {
  title: "Planes — EduConecta",
  description:
    "Modelos de aporte para tu colegio. S/ 2 mensuales por familia, plan activado por el equipo EduConecta.",
}

interface Plan {
  name: string
  tagline: string
  highlight: boolean
  parentPrice: string
  features: { label: string; included: boolean }[]
}

const plans: Plan[] = [
  {
    name: "Esencial",
    tagline: "Para colegios que recién empiezan a digitalizarse.",
    highlight: false,
    parentPrice: "S/ 2",
    features: [
      { label: "Hasta 50 estudiantes", included: true },
      { label: "Registro de asistencia", included: true },
      { label: "Calificaciones básicas", included: true },
      { label: "Tareas y comunicados", included: true },
      { label: "Horarios de clase", included: true },
      { label: "Notificaciones push", included: false },
      { label: "Módulo de disciplina", included: false },
      { label: "Reportes y exportación", included: false },
      { label: "Soporte prioritario", included: false },
      { label: "Dominio personalizado", included: false },
      { label: "Multi-sede", included: false },
    ],
  },
  {
    name: "Profesional",
    tagline: "El más usado por colegios en crecimiento.",
    highlight: true,
    parentPrice: "S/ 2",
    features: [
      { label: "Hasta 500 estudiantes", included: true },
      { label: "Registro de asistencia", included: true },
      { label: "Calificaciones básicas", included: true },
      { label: "Tareas y comunicados", included: true },
      { label: "Horarios de clase", included: true },
      { label: "Notificaciones push", included: true },
      { label: "Módulo de disciplina", included: true },
      { label: "Reportes y exportación", included: true },
      { label: "Soporte prioritario", included: false },
      { label: "Dominio personalizado", included: false },
      { label: "Multi-sede", included: false },
    ],
  },
  {
    name: "Institucional",
    tagline: "Para redes educativas y colegios grandes.",
    highlight: false,
    parentPrice: "S/ 2",
    features: [
      { label: "Estudiantes ilimitados", included: true },
      { label: "Registro de asistencia", included: true },
      { label: "Calificaciones básicas", included: true },
      { label: "Tareas y comunicados", included: true },
      { label: "Horarios de clase", included: true },
      { label: "Notificaciones push", included: true },
      { label: "Módulo de disciplina", included: true },
      { label: "Reportes y exportación", included: true },
      { label: "Soporte prioritario 24/7", included: true },
      { label: "Dominio personalizado", included: true },
      { label: "Multi-sede", included: true },
    ],
  },
]

export default function PlanesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-900">
      <header className="border-b border-gray-100 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight text-gray-900 dark:text-white/90">
            EduConecta
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-4xl mx-auto px-6 pt-16 pb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Planes y aporte
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white/90">
            S/ 2 al mes por familia
          </h1>
          <p className="mt-4 text-base text-gray-500 dark:text-zinc-400 max-w-2xl mx-auto">
            Cada padre de familia aporta <strong className="text-gray-700 dark:text-zinc-200">S/ 2 mensuales</strong>.
            El colegio recauda el total entre sus familias y nos lo transfiere. Nosotros
            activamos el plan correspondiente cuando confirmamos el pago.
          </p>

          <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/40 px-5 py-4 text-xs text-gray-500 dark:text-zinc-400">
            <span className="font-semibold text-gray-700 dark:text-zinc-200">¿Cómo funciona?</span>
            <span>1. La familia paga S/ 2 al colegio</span>
            <span aria-hidden>·</span>
            <span>2. El colegio transfiere el total</span>
            <span aria-hidden>·</span>
            <span>3. Activamos el plan desde nuestro panel</span>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <PlanCard key={plan.name} plan={plan} />
            ))}
          </div>

          <p className="mt-8 text-center text-xs text-gray-400 dark:text-zinc-500">
            El monto mensual que paga el colegio depende de la cantidad de familias
            aportantes. No hay costo fijo de plataforma.
          </p>
        </section>

        <section className="border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/30">
          <div className="max-w-3xl mx-auto px-6 py-16 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90">
              ¿Listo para activar EduConecta en tu colegio?
            </h2>
            <p className="mt-3 text-sm text-gray-500 dark:text-zinc-400">
              Crea una cuenta y nuestro equipo se pondrá en contacto para coordinar el
              aporte y activar el plan que mejor se ajuste a tu comunidad educativa.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block rounded-[30px] bg-gray-900 dark:bg-white px-8 py-3 text-sm font-medium text-white dark:text-gray-900 hover:bg-black dark:hover:bg-gray-100 transition-all"
            >
              Crear cuenta
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <div
      className={
        "relative rounded-3xl p-8 transition-all " +
        (plan.highlight
          ? "bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-500 shadow-lg shadow-emerald-500/10"
          : "bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700")
      }
    >
      {plan.highlight && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white">
          Más popular
        </span>
      )}
      <p
        className={
          "text-xs font-semibold uppercase tracking-widest " +
          (plan.highlight ? "text-emerald-700 dark:text-emerald-400" : "text-gray-400 dark:text-zinc-500")
        }
      >
        {plan.name}
      </p>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white/90">
          {plan.parentPrice}
        </span>
        <span className="text-sm text-gray-500 dark:text-zinc-400">/ familia / mes</span>
      </div>
      <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">{plan.tagline}</p>

      <Link
        href="/login"
        className={
          "mt-6 block w-full text-center rounded-[30px] py-3 text-sm font-medium transition-all " +
          (plan.highlight
            ? "bg-emerald-500 text-white hover:bg-emerald-600"
            : "bg-gray-900 text-white hover:bg-black dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100")
        }
      >
        Crear cuenta
      </Link>

      <ul className="mt-6 space-y-2.5">
        {plan.features.map((f) => (
          <li key={f.label} className="flex items-start gap-2 text-sm">
            {f.included ? (
              <svg
                aria-hidden
                className="size-5 shrink-0 text-emerald-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg
                aria-hidden
                className="size-5 shrink-0 text-gray-300 dark:text-zinc-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            )}
            <span
              className={
                f.included
                  ? "text-gray-700 dark:text-zinc-200"
                  : "text-gray-400 dark:text-zinc-600 line-through decoration-gray-300 dark:decoration-zinc-700"
              }
            >
              {f.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}