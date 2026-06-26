"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Card } from "@heroui/react"
import IconClient from "@/components/IconClient"
import AnimatedCounter from "@/components/AnimatedCounter"
import ThemeToggle from "@/components/ThemeToggle"

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
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black overflow-x-hidden">
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto w-full"
      >
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="text-lg font-bold tracking-tight text-black dark:text-white/90"
        >
          EduConecta
        </motion.span>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="flex items-center gap-2"
        >
          <ThemeToggle />
          <Link
            href="/login"
            className="inline-flex items-center justify-center size-10 sm:size-auto sm:px-6 sm:py-2.5 text-sm font-medium text-white bg-black dark:text-black dark:bg-white rounded-full sm:rounded-[30px] hover:bg-gray-800 dark:hover:bg-zinc-200 transition-all duration-200"
            aria-label="Iniciar Sesión"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:hidden">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            <span className="hidden sm:inline">Iniciar Sesión</span>
          </Link>
        </motion.div>
      </motion.header>

      <main className="flex-1">
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex flex-col items-center text-center px-6 pt-16 pb-16 sm:pt-24 sm:pb-24 max-w-6xl mx-auto"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl bg-gradient-to-r from-black via-emerald-800 to-black dark:from-white dark:via-emerald-400 dark:to-white bg-clip-text text-transparent"
          >
            EduConecta
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.45 }}
            className="mt-5 text-lg text-gray-400 dark:text-zinc-500"
          >
            Seguimiento escolar en tiempo real
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="mt-5 text-base text-gray-600 dark:text-zinc-400 max-w-xl leading-relaxed"
          >
            Una plataforma integral que conecta a padres, profesores y
            administradores para facilitar el seguimiento académico y la
            comunicación en la comunidad educativa.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.75 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href="/login"
              className="mt-8 sm:mt-10 inline-flex items-center gap-2 px-8 sm:px-10 py-3.5 text-base font-medium text-white bg-black dark:text-black dark:bg-white rounded-[25px] hover:bg-gray-800 dark:hover:bg-zinc-200 transition-all duration-200"
            >
              Comenzar ahora
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <IconClient icon="lucide:arrow-right" className="size-4" />
              </motion.span>
            </Link>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-12 sm:mt-16 w-full grid gap-6 sm:grid-cols-2 lg:grid-cols-4 text-left"
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
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="border-t border-gray-100 dark:border-zinc-800 bg-[#fafafa] dark:bg-black"
        >
          <div className="max-w-5xl mx-auto px-6 py-16 sm:py-24">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-2xl font-bold text-center text-black dark:text-white/90 tracking-tight"
            >
              ¿Por qué elegir EduConecta?
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

      </main>

      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="border-t border-gray-100 dark:border-zinc-800 py-8 text-center text-sm text-gray-400 dark:text-zinc-500"
      >
        &copy; {new Date().getFullYear()} EduConecta. Todos los derechos reservados.
      </motion.footer>
    </div>
  )
}
