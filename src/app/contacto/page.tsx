"use client"

import { useState } from "react"
import Link from "next/link"
import SiteFooter from "@/components/SiteFooter"

const WHATSAPP_NUMBER = "51999999999"
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola, vengo de EduConecta y quiero más información.")}`
const CONTACT_EMAIL = "contacto@educonecta.pe"

export default function ContactoPage() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
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
    if (!form.directorName.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Completa los campos obligatorios.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/public/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          institutionName: form.institutionName.trim() || "No especificado",
          directorName: form.directorName.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim() || "—",
          plan: null,
          message: form.message.trim(),
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || "No se pudo enviar el mensaje.")
        return
      }
      setSubmitted(true)
    } catch {
      setError("Error de red. Inténtalo nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black">
      <header className="border-b border-gray-100 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight text-gray-900 dark:text-white/90">
            EduConecta
          </Link>
          <div className="flex items-center gap-5">
            <Link
              href="/funcionalidades"
              className="text-sm font-medium text-gray-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200"
            >
              Funcionalidades
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
        <section className="max-w-4xl mx-auto px-6 pt-16 pb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Contacto
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white/90">
            Hablemos de tu colegio
          </h1>
          <p className="mt-4 text-base text-gray-500 dark:text-zinc-400 max-w-2xl mx-auto">
            Te respondemos en menos de 24 horas hábiles. También puedes escribirnos por
            WhatsApp o agendar una demo.
          </p>
        </section>

        <section className="max-w-6xl mx-auto px-6 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <aside className="lg:col-span-2 space-y-4">
              <ContactCard
                icon="mail"
                label="Email"
                value={CONTACT_EMAIL}
                href={`mailto:${CONTACT_EMAIL}`}
              />
              <ContactCard
                icon="chat"
                label="WhatsApp"
                value="+51 999 999 999"
                href={WHATSAPP_URL}
                external
              />
              <ContactCard
                icon="schedule"
                label="Horario de atención"
                value="Lun a Vie · 9:00 a 18:00 (PET)"
              />
              <ContactCard
                icon="location_on"
                label="Ubicación"
                value="Lima, Perú"
              />

              <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/30 p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  ¿Buscas algo formal?
                </p>
                <p className="mt-2 text-sm text-gray-600 dark:text-zinc-300">
                  Revisa nuestra documentación legal y de seguridad.
                </p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs">
                  <Link href="/seguridad" className="text-emerald-600 dark:text-emerald-400 hover:underline">Seguridad</Link>
                  <Link href="/privacidad" className="text-emerald-600 dark:text-emerald-400 hover:underline">Privacidad</Link>
                  <Link href="/terminos" className="text-emerald-600 dark:text-emerald-400 hover:underline">Términos</Link>
                </div>
              </div>
            </aside>

            <div className="lg:col-span-3">
              <div className="rounded-3xl border border-gray-100 dark:border-zinc-800 bg-white p-6 sm:p-8">
                {submitted ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="inline-flex size-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                      <svg className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90">Mensaje recibido</h3>
                      <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400 max-w-sm mx-auto">
                        Te respondemos por email en menos de 24 horas hábiles.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSubmitted(false)
                        setForm({ institutionName: "", directorName: "", email: "", phone: "", message: "" })
                      }}
                      className="rounded-[30px] bg-emerald-600 hover:bg-emerald-700 transition-colors duration-200 px-6 py-2.5 text-sm font-medium text-white"
                    >
                      Enviar otro
                    </button>
                  </div>
                ) : (
                  <form onSubmit={submit} className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white/90">Envíanos un mensaje</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Colegio</label>
                        <input
                          value={form.institutionName}
                          onChange={(e) => update("institutionName", e.target.value)}
                          className="w-full rounded-[30px] border border-gray-200 bg-white text-gray-900 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                          placeholder="Colegio San Martín"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Nombre del director *</label>
                        <input
                          required
                          value={form.directorName}
                          onChange={(e) => update("directorName", e.target.value)}
                          className="w-full rounded-[30px] border border-gray-200 bg-white text-gray-900 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                          placeholder="Juan Pérez"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Email *</label>
                        <input
                          required
                          type="email"
                          value={form.email}
                          onChange={(e) => update("email", e.target.value)}
                          className="w-full rounded-[30px] border border-gray-200 bg-white text-gray-900 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                          placeholder="tucorreo@gmail.com"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Teléfono</label>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => update("phone", e.target.value)}
                          className="w-full rounded-[30px] border border-gray-200 bg-white text-gray-900 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                          placeholder="987654321"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Mensaje *</label>
                      <textarea
                        required
                        rows={5}
                        value={form.message}
                        onChange={(e) => update("message", e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 bg-white text-gray-900 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors resize-none"
                        placeholder="¿En qué podemos ayudarte?"
                      />
                    </div>

                    {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-[30px] bg-emerald-600 hover:bg-emerald-700 transition-colors duration-200 py-3 text-sm font-medium text-white disabled:opacity-50"
                    >
                      {loading ? "Enviando…" : "Enviar mensaje"}
                    </button>

                    <p className="text-[11px] text-center text-gray-400 dark:text-zinc-500">
                      Al enviar aceptas nuestra{" "}
                      <Link href="/privacidad" className="underline hover:text-emerald-600">Política de Privacidad</Link>.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />

      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escríbenos por WhatsApp"
        className="fixed bottom-5 right-5 z-50 inline-flex items-center justify-center size-14 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-colors duration-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-7" fill="currentColor">
          <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.595 5.39l-.999 3.648 3.893-.737zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
        </svg>
      </a>
    </div>
  )
}

function ContactCard({
  icon,
  label,
  value,
  href,
  external,
}: {
  icon: string
  label: string
  value: string
  href?: string
  external?: boolean
}) {
  const inner = (
    <div className="flex items-start gap-3 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white p-4 transition-colors duration-200 hover:border-emerald-300 dark:hover:border-emerald-700">
      <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
        <span className="material-icons text-xl">{icon}</span>
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-gray-800 dark:text-zinc-200">{value}</p>
      </div>
    </div>
  )
  if (!href) return inner
  return (
    <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="block">
      {inner}
    </a>
  )
}