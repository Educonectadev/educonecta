"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Card } from "@heroui/react"
import IconClient from "@/components/IconClient"
import AnimatedCounter from "@/components/AnimatedCounter"

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
    color: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    icon: "lucide:file",
    title: "Papel ahorrado",
    description: "Hojas de papel que se dejan de usar al digitalizar la gestión escolar.",
    valueKey: "paperSaved" as const,
    suffix: " hojas/mes",
    color: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    icon: "lucide:trees",
    title: "Árboles salvados",
    description: "Árboles que no necesitan ser talados gracias a la reducción del consumo de papel.",
    valueKey: "treesSaved" as const,
    suffix: " árboles/año",
    color: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    icon: "lucide:globe",
    title: "CO₂ evitado",
    description: "Toneladas de dióxido de carbono que se dejan de emitir al reducir la producción de papel.",
    valueKey: "co2Saved" as const,
    suffix: " kg CO₂/año",
    color: "bg-teal-50",
    iconColor: "text-teal-600",
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
    <div className="flex flex-col min-h-screen bg-white">
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
          className="text-lg font-bold tracking-tight text-black"
        >
          EduConecta
        </motion.span>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <Link
            href="/login"
            className="inline-block px-6 py-2.5 text-sm font-medium text-white bg-black rounded-[30px] hover:bg-gray-800 transition-all duration-200"
          >
            Iniciar Sesión
          </Link>
        </motion.div>
      </motion.header>

      <main className="flex-1">
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex flex-col items-center text-center px-6 pt-24 pb-32 max-w-3xl mx-auto"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-5xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-black via-emerald-800 to-black bg-clip-text text-transparent"
          >
            EduConecta
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.45 }}
            className="mt-5 text-lg text-gray-400"
          >
            Seguimiento escolar en tiempo real
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="mt-5 text-base text-gray-600 max-w-xl leading-relaxed"
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
              className="mt-10 inline-flex items-center gap-2 px-10 py-3.5 text-base font-medium text-white bg-black rounded-[25px] hover:bg-gray-800 transition-all duration-200"
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
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="border-t border-gray-100 bg-[#fafafa]"
        >
          <div className="max-w-5xl mx-auto px-6 py-24">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-2xl font-bold text-center text-black tracking-tight"
            >
              ¿Por qué elegir EduConecta?
            </motion.h2>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {features.map((feature) => (
                <motion.div
                  key={feature.title}
                  variants={cardVariants}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="flex flex-col items-center text-center p-8 border border-gray-100 rounded-[25px] bg-white hover:shadow-sm hover:border-gray-200 transition-all duration-200"
                >
                  <div className="size-12 rounded-xl flex items-center justify-center bg-gray-50 text-gray-600 mb-4">
                    <IconClient icon={feature.icon} className="size-6" />
                  </div>
                  <h3 className="text-base font-semibold text-black">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-400 leading-relaxed">
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
          className="border-t border-gray-100 bg-gradient-to-b from-green-50/40 to-white"
        >
          <div className="max-w-6xl mx-auto px-6 py-24">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-center max-w-2xl mx-auto"
            >
              <motion.span
                whileHover={{ scale: 1.03 }}
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full"
              >
                <IconClient icon="lucide:leaf" className="size-3.5" />
                Impacto ambiental
              </motion.span>
              <h2 className="mt-6 text-2xl font-bold text-black tracking-tight">
                Educación digital para un futuro sostenible
              </h2>
              <p className="mt-3 text-sm text-gray-400 leading-relaxed">
                Cada hoja de papel que ahorramos es un paso hacia la conservación de la Amazonía peruana.
                Al digitalizar la gestión escolar, reducimos la tala de árboles y protegemos nuestro pulmón verde.
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {impactCards.map((card, i) => (
                <motion.div
                  key={card.title}
                  custom={i}
                  variants={statCardVariants}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <Card
                    className={`flex-col items-center text-center p-8 border rounded-[25px] ${card.color} border-transparent`}
                  >
                    <div className={`size-12 rounded-xl flex items-center justify-center ${card.iconColor} bg-white/60`}>
                      <IconClient icon={card.icon} className="size-6" />
                    </div>
                    <p className="mt-4 text-3xl font-bold text-black">
                      <AnimatedCounter value={data[card.valueKey]} suffix={card.suffix} />
                    </p>
                    <p className="mt-2 text-sm font-semibold text-black">
                      {card.title}
                    </p>
                    <p className="mt-2 text-xs text-gray-400 leading-relaxed max-w-[220px]">
                      {card.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={containerVariants}
              className="mt-10 grid gap-6 sm:grid-cols-2"
            >
              <motion.div variants={itemVariants} whileHover={{ y: -4 }}>
                <Card className="relative overflow-hidden border border-gray-100 rounded-[25px] gap-0">
                  <div className="absolute inset-0">
                    <img
                      alt="Amazonía peruana"
                      className="h-full w-full object-cover opacity-20"
                      src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&q=80"
                    />
                  </div>
                  <div className="relative p-8">
                    <div className="size-12 rounded-xl flex items-center justify-center bg-emerald-100 text-emerald-600">
                      <IconClient icon="lucide:trees" className="size-6" />
                    </div>
                    <p className="mt-4 text-lg font-bold text-black">
                      Protección de la Amazonía peruana
                    </p>
                    <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                      La Amazonía peruana pierde más de <strong>150 mil hectáreas</strong> de bosque cada año.
                      La industria del papel es una de las causas de esta deforestación.
                      Con EduConecta, cada institución que se suma a la digitalización
                      reduce significativamente su huella de papel, contribuyendo directamente
                      a disminuir la demanda de pulpa de madera.
                    </p>
                    <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                      Si tu institución se une a las{" "}
                      <strong>{data.institutionCount > 0 ? data.institutionCount : "más de 0"} instituciones activas</strong>,
                      juntos podemos evitar la tala de{" "}
                      <strong>{data.treesSaved.toLocaleString("es-PE")} árboles al año</strong>{" "}
                      y preservar la selva peruana para las futuras generaciones.
                    </p>
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants} whileHover={{ y: -4 }}>
                <Card className="relative overflow-hidden border border-gray-100 rounded-[25px] gap-0">
                  <div className="absolute inset-0">
                    <img
                      alt="Escuela sostenible"
                      className="h-full w-full object-cover opacity-15"
                      src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80"
                    />
                  </div>
                  <div className="relative p-8">
                    <div className="size-12 rounded-xl flex items-center justify-center bg-amber-100 text-amber-600">
                      <IconClient icon="lucide:recycle" className="size-6" />
                    </div>
                    <p className="mt-4 text-lg font-bold text-black">
                      Beneficios de la digitalización
                    </p>
                    <ul className="mt-4 space-y-4">
                      <li className="flex gap-3">
                        <IconClient icon="lucide:circle-check" className="size-5 shrink-0 text-emerald-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-black">Sin uso de papel</p>
                          <p className="text-xs text-gray-400">Comunicados, calificaciones y asistencias 100% digitales.</p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <IconClient icon="lucide:circle-check" className="size-5 shrink-0 text-emerald-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-black">Acceso desde cualquier lugar</p>
                          <p className="text-xs text-gray-400">Padres y profesores consultan información sin imprimir.</p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <IconClient icon="lucide:circle-check" className="size-5 shrink-0 text-emerald-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-black">Datos en tiempo real</p>
                          <p className="text-xs text-gray-400">Reportes actualizados sin necesidad de fichas físicas.</p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <IconClient icon="lucide:circle-check" className="size-5 shrink-0 text-emerald-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-black">Compromiso con el medio ambiente</p>
                          <p className="text-xs text-gray-400">Cada institución digitalizada ayuda a conservar la Amazonía.</p>
                        </div>
                      </li>
                    </ul>
                    <div className="mt-6">
                      <Link
                        href="/login"
                        className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-black rounded-[25px] hover:bg-gray-800 transition-all duration-200"
                      >
                        Suma tu institución
                        <IconClient icon="lucide:arrow-right" className="size-4" />
                      </Link>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>
      </main>

      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="border-t border-gray-100 py-8 text-center text-sm text-gray-400"
      >
        &copy; {new Date().getFullYear()} EduConecta. Todos los derechos reservados.
      </motion.footer>
    </div>
  )
}
