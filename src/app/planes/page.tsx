"use client"

import { useState } from "react"
import Link from "next/link"
import Modal from "@/components/Modal"
import SiteFooter from "@/components/SiteFooter"

interface Plan {
  name: string
  key: "ESENCIAL" | "PROFESIONAL" | "INSTITUCIONAL" | null
  tagline: string
  highlight: boolean
  parentPrice: string
  features: { label: string; included: boolean }[]
}

const plans: Plan[] = [
  {
    name: "Esencial",
    key: "ESENCIAL",
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
    key: "PROFESIONAL",
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
    key: "INSTITUCIONAL",
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
  const [showForm, setShowForm] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [submitted, setSubmitted] = useState(false)

  function openContact(plan: Plan | null) {
    setSelectedPlan(plan)
    setShowForm(true)
    setSubmitted(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black">
      <header className="border-b border-gray-100 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight text-gray-900 dark:text-white/90">
            EduConecta
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-gray-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200"
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
              <PlanCard key={plan.name} plan={plan} onContact={() => openContact(plan)} />
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
              Déjanos tus datos y nuestro equipo se pondrá en contacto en menos de 24 horas.
            </p>
            <button
              onClick={() => openContact(null)}
              className="mt-6 inline-block rounded-[30px] bg-emerald-600 px-8 py-3 text-sm font-medium text-white hover:bg-emerald-700 transition-colors duration-200"
            >
              Quiero que me contacten
            </button>
          </div>
        </section>
      </main>

      <SiteFooter />

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={submitted ? "¡Solicitud enviada!" : "Quiero que me contacten"}
        size="md"
      >
        {submitted ? (
          <SubmittedState onClose={() => setShowForm(false)} />
        ) : (
          <ContactForm
            selectedPlan={selectedPlan}
            onSubmitted={() => setSubmitted(true)}
          />
        )}
      </Modal>
    </div>
  )
}

function PlanCard({ plan, onContact }: { plan: Plan; onContact: () => void }) {
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
          (plan.highlight ? "text-emerald-700 dark:text-emerald-400" : "text-gray-400 dark:text-white")
        }
      >
        {plan.name}
      </p>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          {plan.parentPrice}
        </span>
        <span className="text-sm text-gray-500 dark:text-white">/ familia / mes</span>
      </div>
      <p className="mt-2 text-sm text-gray-500 dark:text-white">{plan.tagline}</p>

      <button
        onClick={onContact}
        className="mt-6 block w-full text-center rounded-[30px] py-3 text-sm font-medium transition-colors duration-200 bg-emerald-600 text-white hover:bg-emerald-700"
      >
        Quiero este plan
      </button>

      <ul className="mt-6 space-y-2.5">
        {plan.features.map((f) => (
          <li key={f.label} className="flex items-start gap-2 text-sm">
            {f.included ? (
              <svg aria-hidden className="size-5 shrink-0 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg aria-hidden className="size-5 shrink-0 text-gray-300 dark:text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            )}
            <span className={f.included ? "text-gray-700 dark:text-white" : "text-gray-400 dark:text-white/60 line-through decoration-gray-300 dark:decoration-white/40"}>
              {f.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ContactForm({
  selectedPlan,
  onSubmitted,
}: {
  selectedPlan: Plan | null
  onSubmitted: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    institutionName: "",
    directorName: "",
    email: "",
    phone: "",
    message: "",
  })

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.institutionName.trim() || !form.directorName.trim() || !form.email.trim() || !form.phone.trim()) {
      setError("Completa todos los campos obligatorios.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/public/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          plan: selectedPlan?.key ?? null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || "No se pudo enviar la solicitud.")
        return
      }
      onSubmitted()
    } catch {
      setError("Error de red. Inténtalo nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {selectedPlan && (
        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-4 py-2.5 text-xs">
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">Plan seleccionado:</span>{" "}
          <span className="text-emerald-800 dark:text-emerald-200">{selectedPlan.name}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Nombre del colegio *</label>
        <input
          required
          value={form.institutionName}
          onChange={(e) => update("institutionName", e.target.value)}
          className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
          placeholder="Colegio San Martín"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Nombre del director *</label>
        <input
          required
          value={form.directorName}
          onChange={(e) => update("directorName", e.target.value)}
          className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
          placeholder="Juan Pérez"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Email *</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
            placeholder="director@colegio.edu.pe"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Teléfono *</label>
          <input
            required
            type="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
            placeholder="987654321"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Mensaje (opcional)</label>
        <textarea
          rows={3}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors resize-none"
          placeholder="Cuéntanos brevemente sobre tu colegio"
        />
      </div>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-[30px] bg-emerald-600 hover:bg-emerald-700 transition-colors duration-200 py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? "Enviando…" : "Enviar solicitud"}
      </button>

      <p className="text-[11px] text-center text-gray-400 dark:text-zinc-500">
        Al enviar aceptas nuestra{" "}
        <Link href="/privacidad" className="underline hover:text-emerald-600">Política de Privacidad</Link>.
      </p>
    </form>
  )
}

function SubmittedState({ onClose }: { onClose: () => void }) {
  return (
    <div className="text-center py-4 space-y-4">
      <div className="inline-flex size-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
        <svg className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90">Recibimos tu solicitud</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400 max-w-sm mx-auto">
          Nuestro equipo te contactará por email o WhatsApp en menos de 24 horas hábiles
          para coordinar el aporte y activar el plan.
        </p>
      </div>
      <button
        onClick={onClose}
        className="rounded-[30px] bg-emerald-600 hover:bg-emerald-700 transition-colors duration-200 px-6 py-2.5 text-sm font-medium text-white"
      >
        Entendido
      </button>
    </div>
  )
}