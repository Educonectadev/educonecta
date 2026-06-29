"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Card } from "@heroui/react"
import IconClient from "@/components/IconClient"
import AnimatedCounter from "@/components/AnimatedCounter"
import ThemeToggle from "@/components/ThemeToggle"
import SiteFooter from "@/components/SiteFooter"
import { TextRoll } from "@/components/ui/skiper-ui/skiper58"
import { FlipWords } from "@/components/ui/flip-words"

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

const impactCards = [
  {
    icon: "lucide:building-2",
    title: "Instituciones activas",
    description: "Colegios que ya confían en EduConecta para su gestión escolar digital.",
    valueKey: "institutionCount" as const,
    suffix: "",
    color: "bg-blue-50 dark:bg-blue-950/30",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: "lucide:file",
    title: "Papel ahorrado",
    description: "Hojas de papel que se dejan de usar al digitalizar la gestión escolar.",
    valueKey: "paperSaved" as const,
    suffix: " hojas/mes",
    color: "bg-amber-50 dark:bg-amber-950/30",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    icon: "lucide:trees",
    title: "Árboles salvados",
    description: "Árboles que no necesitan ser talados gracias a la reducción del consumo de papel.",
    valueKey: "treesSaved" as const,
    suffix: " árboles/año",
    color: "bg-emerald-50 dark:bg-emerald-950/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: "lucide:globe",
    title: "CO₂ evitado",
    description: "Toneladas de dióxido de carbono que se dejan de emitir al reducir la producción de papel.",
    valueKey: "co2Saved" as const,
    suffix: " kg CO₂/año",
    color: "bg-teal-50 dark:bg-teal-950/30",
    iconColor: "text-teal-600 dark:text-teal-400",
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
}

const statCardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
}

export default function HomeContent({ data }: { data: ImpactData }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [pagesOpen, setPagesOpen] = useState(false)

  const pageLinks = [
    { href: "/funcionalidades", label: "Funcionalidades" },
    { href: "/planes", label: "Planes" },
    { href: "/contacto", label: "Contacto" },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950 overflow-x-hidden">
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center justify-center px-4"
      >
        <nav className="flex flex-col items-center w-full">
          <div className="flex items-center justify-between p-4 md:px-24 lg:px-32 xl:px-40 md:py-4 w-full relative">
            <Link href="/" className="text-lg font-bold tracking-tight text-black dark:text-white/90">
              EduConecta
            </Link>

            <div id="menu" className={`${mobileOpen ? "max-md:w-full" : "max-md:w-0"} max-md:fixed max-md:top-0 max-md:z-50 max-md:left-0 max-md:transition-all max-md:duration-300 max-md:overflow-hidden max-md:h-screen max-md:bg-white/25 max-md:backdrop-blur max-md:flex-col max-md:justify-center flex items-center gap-7.5 text-sm`}>
              <div className="group relative max-md:flex max-md:flex-col max-md:items-center">
                <button type="button" onClick={() => setPagesOpen((prev) => !prev)} className="flex items-center gap-1 text-gray-800 dark:text-zinc-300 hover:text-gray-600 dark:hover:text-zinc-400">
                  Plataforma
                  <svg className={`transition-transform duration-200 md:group-hover:rotate-180 ${pagesOpen ? "rotate-180" : ""}`} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <div className={`${pagesOpen ? "mt-3 flex" : "hidden"} flex-col gap-1 md:absolute md:left-1/2 md:top-full md:mt-2 md:flex md:min-w-32 md:-translate-x-1/2 md:rounded-2xl md:border md:border-gray-200 dark:md:border-zinc-700 md:bg-white dark:md:bg-zinc-900 md:p-1.5 md:shadow-[0_18px_50px_rgba(0,0,0,0.08)] md:opacity-0 md:invisible md:-translate-y-2 md:transition-all md:duration-200 md:group-hover:visible md:group-hover:translate-y-0 md:group-hover:opacity-100`}>
                  {pageLinks.map((page) => (
                    <Link key={page.href} href={page.href} onClick={() => { setPagesOpen(false); setMobileOpen(false) }} className="rounded-lg px-3 py-2 text-center text-gray-700 dark:text-zinc-300 transition hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white">
                      {page.label}
                    </Link>
                  ))}
                </div>
              </div>
              {pageLinks.map((page) => (
                <Link key={page.href} href={page.href} onClick={() => setMobileOpen(false)} className="text-gray-800 dark:text-zinc-300 hover:text-gray-600 dark:hover:text-zinc-400 max-md:block">
                  {page.label}
                </Link>
              ))}
              <button onClick={() => { setMobileOpen(false); setPagesOpen(false) }} className="md:hidden bg-zinc-900 hover:bg-zinc-800 text-white p-2 rounded-md aspect-square font-medium transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link href="/login" className="hidden md:inline-flex items-center gap-1 btn-primary px-6 py-2.5 rounded-3xl text-sm font-medium transition cursor-pointer">
                Iniciar Sesión
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="m5.685 14.164 8.122-8.333M5.685 5.83h8.122v8.334" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link href="/login" className="md:hidden btn-primary p-2 rounded-md aspect-square font-medium transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
              </Link>
              <button onClick={() => setMobileOpen(true)} className="md:hidden bg-zinc-900 hover:bg-zinc-800 text-white p-2 rounded-md aspect-square font-medium transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12h16" /><path d="M4 18h16" /><path d="M4 6h16" />
                </svg>
              </button>
            </div>
          </div>
        </nav>
      </motion.header>

      <main className="flex-1">
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex flex-col items-center text-center px-6 pt-16 pb-16 sm:pt-20 sm:pb-24 max-w-6xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="flex flex-wrap items-center justify-center gap-2 pl-2.5 pr-4 py-1.5 rounded-full border border-gray-200 dark:border-zinc-700"
          >
            <span className="px-2 py-0.5 rounded-full border border-emerald-600 bg-emerald-100 text-xs text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-500 font-medium">
              NUEVO
            </span>
            <span className="text-sm text-gray-700 dark:text-zinc-400">Plataforma 2.0 — Gestión escolar inteligente</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-5xl md:text-[64px]/18 font-medium text-gray-900 dark:text-white/90 bg-clip-text leading-tight max-w-[700px] mt-4"
          >
            La plataforma que moderniza tu colegio
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.55 }}
            className="mt-5 text-base md:text-lg text-gray-400 dark:text-zinc-500"
          >
            Seguimiento escolar{" "}
            <FlipWords
              words={["en tiempo real", "sin papel", "desde cualquier lugar", "para toda la comunidad"]}
              className="text-gray-400 dark:text-zinc-500"
            />
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            className="mt-3 text-sm md:text-base text-gray-600 dark:text-zinc-400 max-w-[500px] leading-relaxed"
          >
            Una plataforma integral que conecta a padres, profesores y administradores para facilitar el seguimiento académico y la comunicación en la comunidad educativa.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.85 }}
            className="flex gap-3.5 mt-10"
          >
            <Link
              href="/login"
              className="inline-flex items-center gap-1 btn-primary font-medium px-5 py-2.5 rounded-xl text-sm transition cursor-pointer"
            >
              Comenzar ahora
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="m6 12 4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link
              href="/funcionalidades"
              className="inline-flex items-center gap-1 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-950 dark:text-white/90 font-medium px-5 py-2.5 rounded-xl text-sm transition cursor-pointer"
            >
              Conoce más
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="m6 12 4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="w-full px-4 md:px-0 mt-13"
          >
            <img
              className="max-h-64 md:max-h-96 object-cover object-top w-full max-w-6xl mx-auto border border-gray-200 dark:border-zinc-800 rounded-[20px]"
              src="https://assets.prebuiltui.com/images/components/hero-section/hero-modern-dashboard.png"
              alt="Dashboard EduConecta"
            />
          </motion.div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className=""
        >
          <div className="max-w-6xl mx-auto px-6 py-16 sm:py-24">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="w-full grid gap-6 sm:grid-cols-2 lg:grid-cols-4 text-left"
            >
              {impactCards
                .filter((_, i) => i === 0)
                .map((card) => (
                  <motion.div
                    key={card.title}
                    variants={statCardVariants}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  >
                    <Card className={`w-full flex-col items-center text-center p-5 sm:p-8 border rounded-[25px] ${card.color} border-transparent`}>
                      <div className={`size-12 rounded-xl flex items-center justify-center ${card.iconColor} bg-white/60 dark:bg-black/40`}>
                        <IconClient icon={card.icon} className="size-6" />
                      </div>
                      <p className="mt-4 text-3xl font-bold text-black dark:text-white/90">
                        <AnimatedCounter value={data[card.valueKey]} suffix={card.suffix} />
                      </p>
                      <p className="mt-2 text-sm font-semibold text-black dark:text-white/90">{card.title}</p>
                      <p className="mt-2 text-xs text-gray-400 dark:text-zinc-500 leading-relaxed max-w-[220px]">{card.description}</p>
                    </Card>
                  </motion.div>
                ))}

              <motion.div
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="lg:col-span-2"
              >
                <Card className="w-full relative overflow-hidden border border-gray-100 dark:border-zinc-800 rounded-[25px] gap-0 h-full">
                  <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/70 via-emerald-800/50 to-black/40 z-10" />
                    <img alt="Amazonía peruana" className="h-full w-full object-cover" src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&q=80" />
                  </div>
                  <div className="relative z-20 p-5 sm:p-8 flex flex-col justify-end min-h-[200px] sm:min-h-[280px]">
                    <div className="size-12 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur-sm text-white">
                      <IconClient icon="lucide:trees" className="size-6" />
                    </div>
                    <p className="mt-4 text-xl font-bold text-white">Protección de la Amazonía peruana</p>
                    <p className="mt-2 text-sm text-white/80 leading-relaxed max-w-lg">
                      {data.institutionCount} instituciones activas evitan la tala de{" "}
                      <strong className="text-emerald-300">{data.treesSaved.toLocaleString("es-PE")} árboles al año</strong>.
                      Cada colegio digitalizado reduce la demanda de pulpa de madera y protege el pulmón verde del planeta.
                    </p>
                    <div className="mt-4 flex gap-3 sm:gap-4">
                      <div>
                        <p className="text-xl sm:text-2xl font-bold text-emerald-300"><AnimatedCounter value={data.treesSaved} suffix="" /></p>
                        <p className="text-xs text-white/60">árboles/año</p>
                      </div>
                      <div className="w-px bg-white/20" />
                      <div>
                        <p className="text-xl sm:text-2xl font-bold text-emerald-300"><AnimatedCounter value={data.institutionCount} suffix="" /></p>
                        <p className="text-xs text-white/60">instituciones</p>
                      </div>
                      <div className="w-px bg-white/20" />
                      <div>
                        <p className="text-xl sm:text-2xl font-bold text-emerald-300"><AnimatedCounter value={data.co2Saved} suffix="" /></p>
                        <p className="text-xs text-white/60">kg CO₂/año</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {impactCards
                .filter((_, i) => i === 3)
                .map((card) => (
                  <motion.div
                    key={card.title}
                    variants={statCardVariants}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  >
                    <Card className={`w-full flex-col items-center text-center p-5 sm:p-8 border rounded-[25px] ${card.color} border-transparent`}>
                      <div className={`size-12 rounded-xl flex items-center justify-center ${card.iconColor} bg-white/60 dark:bg-black/40`}>
                        <IconClient icon={card.icon} className="size-6" />
                      </div>
                      <p className="mt-4 text-3xl font-bold text-black dark:text-white/90">
                        <AnimatedCounter value={data[card.valueKey]} suffix={card.suffix} />
                      </p>
                      <p className="mt-2 text-sm font-semibold text-black dark:text-white/90">{card.title}</p>
                      <p className="mt-2 text-xs text-gray-400 dark:text-zinc-500 leading-relaxed max-w-[220px]">{card.description}</p>
                    </Card>
                  </motion.div>
                ))}

              {impactCards
                .filter((_, i) => i === 1)
                .map((card) => (
                  <motion.div
                    key={card.title}
                    variants={statCardVariants}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  >
                    <Card className={`w-full flex-col items-center text-center p-5 sm:p-8 border rounded-[25px] ${card.color} border-transparent`}>
                      <div className={`size-12 rounded-xl flex items-center justify-center ${card.iconColor} bg-white/60 dark:bg-black/40`}>
                        <IconClient icon={card.icon} className="size-6" />
                      </div>
                      <p className="mt-4 text-3xl font-bold text-black dark:text-white/90">
                        <AnimatedCounter value={data[card.valueKey]} suffix={card.suffix} />
                      </p>
                      <p className="mt-2 text-sm font-semibold text-black dark:text-white/90">{card.title}</p>
                      <p className="mt-2 text-xs text-gray-400 dark:text-zinc-500 leading-relaxed max-w-[220px]">{card.description}</p>
                    </Card>
                  </motion.div>
                ))}

              <motion.div
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="lg:col-span-2"
              >
                <Card className="w-full relative overflow-hidden border border-gray-100 dark:border-zinc-800 rounded-[25px] gap-0 h-full">
                  <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-900/60 via-amber-800/40 to-black/30 z-10" />
                    <img alt="Escuela sostenible" className="h-full w-full object-cover" src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80" />
                  </div>
                  <div className="relative z-20 p-5 sm:p-8 flex flex-col justify-end min-h-[200px] sm:min-h-[280px]">
                    <div className="size-12 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur-sm text-white">
                      <IconClient icon="lucide:recycle" className="size-6" />
                    </div>
                    <p className="mt-4 text-xl font-bold text-white">Beneficios de la digitalización</p>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                      <div className="flex items-center gap-2">
                        <IconClient icon="lucide:circle-check" className="size-4 shrink-0 text-emerald-300" />
                        <span className="text-sm text-white/90">Sin uso de papel</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IconClient icon="lucide:circle-check" className="size-4 shrink-0 text-emerald-300" />
                        <span className="text-sm text-white/90">Acceso desde cualquier lugar</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IconClient icon="lucide:circle-check" className="size-4 shrink-0 text-emerald-300" />
                        <span className="text-sm text-white/90">Datos en tiempo real</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IconClient icon="lucide:circle-check" className="size-4 shrink-0 text-emerald-300" />
                        <span className="text-sm text-white/90">Compromiso ambiental</span>
                      </div>
                    </div>
                    <div className="mt-5">
                      <Link href="/login" className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-white/20 backdrop-blur-sm rounded-[25px] hover:bg-white/30 transition-all duration-200">
                        Suma tu institución
                        <IconClient icon="lucide:arrow-right" className="size-4" />
                      </Link>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {impactCards
                .filter((_, i) => i === 2)
                .map((card) => (
                  <motion.div
                    key={card.title}
                    variants={statCardVariants}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  >
                    <Card className={`w-full flex-col items-center text-center p-5 sm:p-8 border rounded-[25px] ${card.color} border-transparent`}>
                      <div className={`size-12 rounded-xl flex items-center justify-center ${card.iconColor} bg-white/60 dark:bg-black/40`}>
                        <IconClient icon={card.icon} className="size-6" />
                      </div>
                      <p className="mt-4 text-3xl font-bold text-black dark:text-white/90">
                        <AnimatedCounter value={data[card.valueKey]} suffix={card.suffix} />
                      </p>
                      <p className="mt-2 text-sm font-semibold text-black dark:text-white/90">{card.title}</p>
                      <p className="mt-2 text-xs text-gray-400 dark:text-zinc-500 leading-relaxed max-w-[220px]">{card.description}</p>
                    </Card>
                  </motion.div>
                ))}
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-950"
        >
          <div className="max-w-5xl mx-auto px-6 py-16 sm:py-24">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-2xl font-bold text-center text-black dark:text-white/90 tracking-tight"
            >
              ¿Por qué elegir{" "}
              <FlipWords
                words={["EduConecta?", "esta plataforma?", "nuestra solución?"]}
                className="text-black dark:text-white/90"
              />
            </motion.h2>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="mt-10 sm:mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {features.map((feature) => (
                <motion.div
                  key={feature.title}
                  variants={cardVariants}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="flex flex-col items-center text-center p-5 sm:p-8 border border-gray-100 dark:border-zinc-800 rounded-[25px] bg-white dark:bg-zinc-950 hover:shadow-sm dark:hover:shadow-white/5 hover:border-gray-200 dark:hover:border-zinc-700 transition-all duration-200"
                >
                  <div className="size-12 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 mb-4">
                    <IconClient icon={feature.icon} className="size-6" />
                  </div>
                  <h3 className="text-base font-semibold text-black dark:text-white/90">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-400 dark:text-zinc-500 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-950"
        >
          <div className="max-w-5xl mx-auto px-6 py-16 sm:py-24 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-2xl font-bold text-center text-black dark:text-white/90 tracking-tight mb-10"
            >
              Explora{" "}
              <FlipWords
                words={["EduConecta", "nuestras funciones", "la plataforma", "todo"]}
                className="text-black dark:text-white/90"
              />
            </motion.h2>
            <motion.ul
              initial="initial"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                visible: { transition: { staggerChildren: 0.08 } },
              }}
              className="flex flex-col items-center justify-center gap-1"
            >
              {[
                { name: "Inicio", href: "/", desc: "Home" },
                { name: "Funcionalidades", href: "/funcionalidades", desc: "Características" },
                { name: "Planes", href: "/planes", desc: "Precios" },
                { name: "Contacto", href: "/contacto", desc: "Soporte" },
                { name: "Iniciar Sesión", href: "/login", desc: "Acceder" },
              ].map((item) => (
                <motion.li
                  key={item.name}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <Link href={item.href} className="block">
                    <TextRoll
                      center
                      className="text-3xl font-extrabold uppercase leading-[0.8] tracking-[-0.03em] transition-colors text-gray-900 dark:text-white/90 hover:text-emerald-600 dark:hover:text-emerald-400 lg:text-4xl"
                    >
                      {item.name}
                    </TextRoll>
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </motion.section>
      </main>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <SiteFooter />
      </motion.div>
    </div>
  )
}
