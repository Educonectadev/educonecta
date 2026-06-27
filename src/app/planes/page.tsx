import type { Metadata } from "next"
import Link from "next/link"
import SiteFooter from "@/components/SiteFooter"

export const metadata: Metadata = {
  title: "Planes — EduConecta",
  description:
    "Elige el plan ideal para tu institución educativa. Esencial, Profesional e Institucional.",
}

interface Plan {
  name: string
  price: string
  period: string
  tagline: string
  highlight: boolean
  ctaLabel: string
  ctaHref: string
  features: { label: string; included: boolean }[]
}

const plans: Plan[] = [
  {
    name: "Esencial",
    price: "S/ 0",
    period: "Para siempre",
    tagline: "Empieza gratis con lo básico.",
    highlight: false,
    ctaLabel: "Crear cuenta gratis",
    ctaHref: "/login",
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
    price: "S/ 149",
    period: "por mes",
    tagline: "La opción más popular entre colegios.",
    highlight: true,
    ctaLabel: "Contratar Profesional",
    ctaHref: "/login",
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
    price: "S/ 399",
    period: "por mes",
    tagline: "Para redes educativas y colegios grandes.",
    highlight: false,
    ctaLabel: "Hablar con ventas",
    ctaHref: "/login",
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

const comparisonRows = [
  { label: "Estudiantes incluidos", esencial: "50", profesional: "500", institucional: "Ilimitados" },
  { label: "Asistencia y calificaciones", esencial: true, profesional: true, institucional: true },
  { label: "Tareas y comunicados", esencial: true, profesional: true, institucional: true },
  { label: "Horarios", esencial: true, profesional: true, institucional: true },
  { label: "Notificaciones push", esencial: false, profesional: true, institucional: true },
  { label: "Módulo de disciplina", esencial: false, profesional: true, institucional: true },
  { label: "Reportes y exportación", esencial: false, profesional: true, institucional: true },
  { label: "Soporte prioritario", esencial: false, profesional: false, institucional: true },
  { label: "Dominio personalizado", esencial: false, profesional: false, institucional: true },
  { label: "Multi-sede", esencial: false, profesional: false, institucional: true },
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
        <section className="max-w-6xl mx-auto px-6 pt-16 pb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Planes y precios
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white/90">
            Elige el plan ideal para tu colegio
          </h1>
          <p className="mt-4 text-base text-gray-500 dark:text-zinc-400 max-w-2xl mx-auto">
            Empieza gratis y crece cuando lo necesites. Sin contratos forzosos, sin
            instalaciones complicadas.
          </p>
        </section>

        <section className="max-w-6xl mx-auto px-6 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <PlanCard key={plan.name} plan={plan} />
            ))}
          </div>

          <p className="mt-8 text-center text-xs text-gray-400 dark:text-zinc-500">
            Los precios no incluyen IGV. Facturamos en soles peruanos.
          </p>
        </section>

        <section className="max-w-6xl mx-auto px-6 pb-20">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90 text-center">
            Compara planes en detalle
          </h2>
          <div className="mt-8 overflow-x-auto rounded-2xl border border-gray-100 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-zinc-800/40">
                  <th className="text-left px-5 py-4 font-semibold text-gray-700 dark:text-zinc-200">
                    Funcionalidad
                  </th>
                  <th className="px-5 py-4 font-semibold text-gray-700 dark:text-zinc-200">Esencial</th>
                  <th className="px-5 py-4 font-semibold text-emerald-700 dark:text-emerald-400">
                    Profesional
                  </th>
                  <th className="px-5 py-4 font-semibold text-gray-700 dark:text-zinc-200">Institucional</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, idx) => (
                  <tr
                    key={row.label}
                    className={
                      idx % 2 === 0
                        ? "bg-white dark:bg-zinc-900"
                        : "bg-gray-50/50 dark:bg-zinc-800/20"
                    }
                  >
                    <td className="px-5 py-3 text-gray-700 dark:text-zinc-300">{row.label}</td>
                    <Cell value={row.esencial} />
                    <Cell value={row.profesional} highlight />
                    <Cell value={row.institucional} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/30">
          <div className="max-w-3xl mx-auto px-6 py-16 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90">
              ¿Necesitas algo a medida?
            </h2>
            <p className="mt-3 text-sm text-gray-500 dark:text-zinc-400">
              Si tu colegio tiene más de 2,000 estudiantes o varias sedes, podemos armar un
              plan personalizado. Escríbenos a{" "}
              <a className="underline" href="mailto:ventas@educonecta.pe">
                ventas@educonecta.pe
              </a>
              .
            </p>
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
          {plan.price}
        </span>
        <span className="text-sm text-gray-500 dark:text-zinc-400">{plan.period}</span>
      </div>
      <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">{plan.tagline}</p>

      <Link
        href={plan.ctaHref}
        className={
          "mt-6 block w-full text-center rounded-[30px] py-3 text-sm font-medium transition-all " +
          (plan.highlight
            ? "bg-emerald-500 text-white hover:bg-emerald-600"
            : "bg-gray-900 text-white hover:bg-black dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100")
        }
      >
        {plan.ctaLabel}
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

function Cell({ value, highlight }: { value: string | boolean; highlight?: boolean }) {
  if (typeof value === "boolean") {
    return (
      <td className={"px-5 py-3 text-center " + (highlight ? "bg-emerald-50/30 dark:bg-emerald-950/10" : "")}>
        {value ? (
          <span className="inline-flex size-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
            <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        ) : (
          <span className="inline-flex size-6 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-zinc-800 dark:text-zinc-600">
            <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </span>
        )}
      </td>
    )
  }
  return (
    <td className={"px-5 py-3 text-center text-gray-700 dark:text-zinc-300 " + (highlight ? "bg-emerald-50/30 dark:bg-emerald-950/10 font-semibold" : "")}>
      {value}
    </td>
  )
}