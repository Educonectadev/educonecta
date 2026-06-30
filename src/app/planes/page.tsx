"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import SiteFooter from "@/components/SiteFooter"
import ThemeToggle from "@/components/ThemeToggle"

interface Plan {
  name: string
  monthlyPrice: number
  yearlyPrice: number
  tagline: string
  isPopular?: boolean
  features: string[]
}

const pricingPlans: Plan[] = [
  {
    name: "Esencial",
    monthlyPrice: 2,
    yearlyPrice: 1.5,
    tagline: "Para colegios que recién empiezan a digitalizarse.",
    features: [
      "Hasta 50 estudiantes",
      "Registro de asistencia",
      "Calificaciones básicas",
      "Tareas y comunicados",
      "Horarios de clase",
    ],
  },
  {
    name: "Profesional",
    monthlyPrice: 2,
    yearlyPrice: 1.5,
    tagline: "El más usado por colegios en crecimiento.",
    isPopular: true,
    features: [
      "Hasta 500 estudiantes",
      "Registro de asistencia",
      "Calificaciones básicas",
      "Tareas y comunicados",
      "Horarios de clase",
      "Notificaciones push",
      "Módulo de disciplina",
      "Reportes y exportación",
    ],
  },
  {
    name: "Institucional",
    monthlyPrice: 2,
    yearlyPrice: 1.5,
    tagline: "Para redes educativas y colegios grandes.",
    features: [
      "Estudiantes ilimitados",
      "Registro de asistencia",
      "Calificaciones básicas",
      "Tareas y comunicados",
      "Horarios de clase",
      "Notificaciones push",
      "Módulo de disciplina",
      "Reportes y exportación",
      "Soporte prioritario 24/7",
      "Dominio personalizado",
      "Multi-sede",
    ],
  },
]

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <circle cx="12" cy="12" r="10" className="fill-emerald-500/15 dark:fill-emerald-400/15" />
      <path
        d="M8 12.5l2.5 2.5L16 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-emerald-600 dark:text-emerald-400"
      />
    </svg>
  )
}

function BillingToggle({
  isYearly,
  onChange,
}: {
  isYearly: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div
      className="relative flex items-center bg-zinc-100 dark:bg-zinc-800/80 rounded-full p-1 w-fit mx-auto cursor-pointer select-none"
      onClick={() => onChange(!isYearly)}
      style={{ border: "1px solid var(--surface-border)" }}
    >
      <div
        className="absolute top-1 bottom-1 w-[calc(50%-2px)] rounded-full bg-white dark:bg-zinc-700 shadow-sm transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ left: isYearly ? "calc(50% + 1px)" : "1px" }}
      />
      <div
        className={`relative z-10 px-5 py-1.5 rounded-full text-sm font-medium transition-colors duration-300 ${
          !isYearly
            ? "text-zinc-900 dark:text-white"
            : "text-zinc-500 dark:text-zinc-400"
        }`}
        onClick={(e) => {
          e.stopPropagation()
          onChange(false)
        }}
      >
        Mensual
      </div>
      <div
        className={`relative z-10 px-5 py-1.5 rounded-full text-sm font-medium transition-colors duration-300 ${
          isYearly
            ? "text-zinc-900 dark:text-white"
            : "text-zinc-500 dark:text-zinc-400"
        }`}
        onClick={(e) => {
          e.stopPropagation()
          onChange(true)
        }}
      >
        Anual
        <span className="ml-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
          -25%
        </span>
      </div>
    </div>
  )
}

export default function PlanesPage() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      <header
        className="sticky top-0 z-50 backdrop-blur-xl border-b"
        style={{
          background: "color-mix(in srgb, var(--background) 75%, transparent)",
          borderColor: "var(--surface-border)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight"
            style={{ color: "var(--foreground)" }}
          >
            EduConecta
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: "var(--muted-foreground)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--foreground)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--muted-foreground)")
              }
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative py-20 md:py-28 px-4 overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 50% -20%, color-mix(in srgb, var(--accent) 8%, transparent), transparent)",
            }}
          />

          <div className="relative max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <span
                className="inline-block text-[11px] font-semibold tracking-[0.2em] uppercase mb-4"
                style={{ color: "var(--muted-foreground)" }}
              >
                Precios
              </span>
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
                style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
              >
                Planes y{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                  Aporte
                </span>
              </h1>
              <p
                className="mt-4 text-base md:text-lg max-w-xl mx-auto"
                style={{ color: "var(--muted-foreground)" }}
              >
                Elige el plan ideal para tu colegio. Precios por familia.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10"
            >
              <BillingToggle isYearly={isYearly} onChange={setIsYearly} />
            </motion.div>
          </div>

          <div className="max-w-[1100px] mx-auto mt-14 md:mt-16 px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {pricingPlans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.1 + index * 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <div
                    className="group relative flex flex-col rounded-[24px] p-6 md:p-7 h-full transition-all duration-300"
                    style={{
                      background: plan.isPopular
                        ? "linear-gradient(135deg, color-mix(in srgb, var(--accent) 6%, var(--surface)), var(--surface))"
                        : "var(--surface)",
                      border: plan.isPopular
                        ? "1.5px solid color-mix(in srgb, var(--accent) 30%, transparent)"
                        : "1px solid var(--surface-border)",
                      boxShadow: plan.isPopular
                        ? "var(--surface-shadow)"
                        : "var(--surface-shadow)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)"
                      e.currentTarget.style.boxShadow = "var(--surface-shadow-hover)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)"
                      e.currentTarget.style.boxShadow = "var(--surface-shadow)"
                    }}
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span
                          className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide px-4 py-1.5 rounded-full"
                          style={{
                            background: "var(--accent)",
                            color: "#fff",
                          }}
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                          Más popular
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-1">
                      <h3
                        className="text-xl font-semibold"
                        style={{
                          fontFamily: "var(--font-display)",
                          color: "var(--foreground)",
                        }}
                      >
                        {plan.name}
                      </h3>
                    </div>

                    <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                      {plan.tagline}
                    </p>

                    <div className="mt-5 flex items-baseline gap-1.5">
                      <span
                        className="text-4xl md:text-5xl font-bold tracking-tight"
                        style={{
                          fontFamily: "var(--font-display)",
                          color: "var(--foreground)",
                        }}
                      >
                        S/ {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                      </span>
                      <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                        / familia / mes
                      </span>
                    </div>

                    {isYearly && (
                      <div className="mt-1">
                        <span className="text-xs line-through" style={{ color: "var(--muted-foreground)" }}>
                          S/ {plan.monthlyPrice}/mes
                        </span>
                        <span className="text-xs font-semibold ml-2 text-emerald-600 dark:text-emerald-400">
                          Ahorras 25%
                        </span>
                      </div>
                    )}

                    <hr
                      className="w-full my-6"
                      style={{ borderColor: "var(--surface-border)" }}
                    />

                    <ul className="flex flex-col gap-3 grow">
                      {plan.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2.5 text-sm"
                          style={{ color: "var(--foreground)" }}
                        >
                          <CheckIcon />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      className="mt-8 w-full text-base font-semibold py-3 rounded-full transition-all duration-200 cursor-pointer"
                      style={{
                        background: plan.isPopular
                          ? "var(--accent)"
                          : "var(--surface-2)",
                        color: plan.isPopular ? "#fff" : "var(--foreground)",
                        border: plan.isPopular
                          ? "none"
                          : "1px solid var(--surface-border)",
                      }}
                      onMouseEnter={(e) => {
                        if (!plan.isPopular) {
                          e.currentTarget.style.background = "var(--surface-3)"
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!plan.isPopular) {
                          e.currentTarget.style.background = "var(--surface-2)"
                        }
                      }}
                    >
                      Quiero este plan
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
