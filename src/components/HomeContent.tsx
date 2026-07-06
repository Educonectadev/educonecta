"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import IconClient from "@/components/IconClient"
import AnimatedCounter from "@/components/AnimatedCounter"
import SiteFooter from "@/components/SiteFooter"
import InstitutionLogos from "@/components/InstitutionLogos"
import LandingNav from "@/components/LandingNav"

interface ImpactData {
  institutionCount: number
  paperSaved: number
  treesSaved: number
  co2Saved: number
}

const features = [
  {
    icon: "lucide:activity",
    title: "Información en tiempo real",
    description: "Calificaciones, asistencias y reportes actualizados al instante.",
  },
  {
    icon: "lucide:message-circle",
    title: "Comunicación directa",
    description: "Conecta con profesores y administradores de forma sencilla.",
  },
  {
    icon: "lucide:school",
    title: "Control escolar",
    description: "Gestiona horarios, materias y rendimiento desde un solo lugar.",
  },
  {
    icon: "lucide:bell",
    title: "Notificaciones",
    description: "Recibe alertas sobre tareas, eventos y novedades importantes.",
  },
]

interface Partner {
  id: number
  name: string
  logoUrl: string
}

const statCards = [
  {
    value: "150+",
    label: "Instituciones activas",
  },
  {
    value: "12K+",
    label: "Estudiantes",
  },
  {
    value: "98%",
    label: "Satisfacción",
  },
]

export default function HomeContent({ data, partners = [] }: { data: ImpactData; partners?: Partner[] }) {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <LandingNav />

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 pt-28 pb-16 md:pt-36 md:pb-28">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--surface-border)] bg-[var(--surface-2)] mb-6">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                  <span className="text-xs font-semibold tracking-wide text-[var(--muted-foreground)]">
                    Plataforma 2.0
                  </span>
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9] text-[var(--foreground)]">
                  La plataforma
                  <br />
                  <span className="text-[var(--accent)]">que moderniza</span>
                  <br />
                  tu colegio
                </h1>

                <p className="mt-6 text-base md:text-lg text-[var(--muted-foreground)] max-w-md leading-relaxed">
                  Una plataforma integral que conecta a padres, profesores y administradores para facilitar el seguimiento académico y la comunicación en la comunidad educativa.
                </p>

                <div className="flex gap-3 mt-8">
                  <Link
                    href="/login"
                    className="sa-btn sa-btn-primary"
                  >
                    Comenzar ahora
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    href="/funcionalidades"
                    className="sa-btn sa-btn-outline"
                  >
                    Conoce más
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <div className="relative rounded-[var(--radius-card)] overflow-hidden">
                  <div className="aspect-[4/5] md:aspect-[3/4] w-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/10 to-transparent z-10" />
                    <img
                      alt="Estudiantes en aula moderna"
                      className="h-full w-full object-cover"
                      src="https://images.unsplash.com/photo-1523050854058-8df90110c7f1?w=800&q=80"
                    />
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6 flex gap-3"
                >
                  <div className="sa-surface px-5 py-4 rounded-[var(--radius-tile)] shadow-[var(--surface-shadow-hover)]">
                    <p className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">{data.institutionCount}</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Instituciones</p>
                  </div>
                  <div className="sa-surface px-5 py-4 rounded-[var(--radius-tile)] shadow-[var(--surface-shadow-hover)]">
                    <p className="text-2xl md:text-3xl font-bold text-[var(--accent)]">{data.treesSaved}</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Árboles salvados</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--surface-border)] bg-[var(--surface-2)]">
          <div className="max-w-7xl mx-auto px-6 py-20 md:py-28">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="text-center max-w-2xl mx-auto mb-14 md:mb-20"
            >
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--foreground)]">
                Todo lo que necesitas
              </h2>
              <p className="mt-4 text-[var(--muted-foreground)] text-base md:text-lg">
                Una plataforma completa para la gestión educativa moderna.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  className="sa-surface p-6 md:p-8 hover:shadow-[var(--surface-shadow-hover)] hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="size-11 rounded-xl flex items-center justify-center bg-[var(--surface-2)] text-[var(--accent)] border border-[var(--surface-border)]">
                    <IconClient icon={feature.icon} className="size-5" />
                  </div>
                  <h3 className="mt-5 text-base font-semibold text-[var(--foreground)]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)] leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--surface-border)]">
          <div className="max-w-7xl mx-auto px-6 py-20 md:py-28">
            <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--foreground)]">
                  Impacto real en
                  <br />
                  <span className="text-[var(--accent)]">educación</span> y medio{" "}
                  <span className="text-[var(--accent)]">ambiente</span>
                </h2>
                <p className="mt-4 text-[var(--muted-foreground)] text-base md:text-lg leading-relaxed">
                  Cada institución digitalizada reduce el consumo de papel y protege nuestros bosques.
                </p>

                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="sa-surface-flat p-5">
                    <p className="text-3xl font-bold text-[var(--foreground)]">
                      <AnimatedCounter value={data.paperSaved} suffix="" />
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">Hojas/mes ahorradas</p>
                  </div>
                  <div className="sa-surface-flat p-5">
                    <p className="text-3xl font-bold text-[var(--accent)]">
                      <AnimatedCounter value={data.co2Saved} suffix="" />
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">kg CO₂/año evitados</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="rounded-[var(--radius-card)] overflow-hidden">
                  <div className="aspect-[4/3] w-full relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/10 to-transparent z-10" />
                    <img
                      alt="Amazonía peruana"
                      className="h-full w-full object-cover"
                      src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&q=80"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <InstitutionLogos partners={partners} />

        <section className="border-t border-[var(--surface-border)] bg-[var(--surface)]">
          <div className="max-w-7xl mx-auto px-6 py-20 md:py-28 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--foreground)]"
            >
              ¿Listo para transformar tu colegio?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 text-[var(--muted-foreground)] text-base md:text-lg max-w-lg mx-auto"
            >
              Únete a las instituciones que ya modernizaron su gestión escolar con EduConecta.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8"
            >
              <Link
                href="/login"
                className="sa-btn sa-btn-primary text-base px-8 py-3"
              >
                Comenzar ahora
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
