import Link from "next/link"
import { Card } from "@heroui/react"
import IconClient from "@/components/IconClient"
import { getSupabaseAdmin } from "@/lib/supabase"

const features = [
  {
    title: "Información en tiempo real",
    description: "Accede a calificaciones, asistencias y reportes actualizados al instante.",
  },
  {
    title: "Comunicación directa",
    description: "Mantente en contacto con profesores y administradores de forma sencilla.",
  },
  {
    title: "Control escolar",
    description: "Gestiona horarios, materias y el rendimiento académico desde un solo lugar.",
  },
  {
    title: "Notificaciones",
    description: "Recibe alertas sobre tareas, eventos y novedades importantes.",
  },
]

const impactCards = [
  {
    icon: "lucide:building-2",
    title: "Instituciones activas",
    description: "Colegios que ya confían en EduConecta para su gestión escolar digital.",
    value: null as number | null,
    suffix: "",
    color: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    icon: "lucide:file",
    title: "Papel ahorrado",
    description: "Hojas de papel que se dejan de usar al digitalizar calificaciones, comunicados y asistencias.",
    value: null as number | null,
    suffix: " hojas/mes",
    color: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    icon: "lucide:trees",
    title: "Árboles salvados",
    description: "Árboles que no necesitan ser talados gracias a la reducción del consumo de papel.",
    value: null as number | null,
    suffix: " árboles/año",
    color: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    icon: "lucide:globe",
    title: "CO₂ evitado",
    description: "Toneladas de dióxido de carbono que se dejan de emitir al reducir la producción de papel.",
    value: null as number | null,
    suffix: " kg CO₂/año",
    color: "bg-teal-50",
    iconColor: "text-teal-600",
  },
]

async function getInstitutionCount(): Promise<number> {
  try {
    const supabase = getSupabaseAdmin()
    const { count } = await supabase
      .from("Institution")
      .select("id", { count: "exact", head: true })
      .eq("isActive", true)
    return count ?? 0
  } catch {
    return 0
  }
}

export const dynamic = "force-dynamic"

export default async function Home() {
  const institutionCount = await getInstitutionCount()
  const estimatedStudentsPerInstitution = 400
  const totalStudents = institutionCount * estimatedStudentsPerInstitution
  const paperSheetsPerStudentPerMonth = 30
  const treesPerSheet = 1 / 16667
  const co2PerSheet = 0.005

  const paperSaved = totalStudents * paperSheetsPerStudentPerMonth
  const treesSaved = Math.round(paperSaved * treesPerSheet * 12)
  const co2Saved = Math.round(paperSaved * co2PerSheet * 12)

  impactCards[0].value = institutionCount
  impactCards[1].value = paperSaved
  impactCards[2].value = treesSaved
  impactCards[3].value = co2Saved

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto w-full">
        <span className="text-lg font-bold tracking-tight text-black">EduConecta</span>
        <Link
          href="/login"
          className="px-6 py-2.5 text-sm font-medium text-white bg-black rounded-[30px] hover:bg-gray-800 transition-all"
        >
          Iniciar Sesión
        </Link>
      </header>

      <main className="flex-1">
        <section className="flex flex-col items-center text-center px-6 py-28 max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight text-black sm:text-6xl">
            EduConecta
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            Seguimiento escolar en tiempo real
          </p>
          <p className="mt-6 text-base text-gray-600 max-w-xl leading-relaxed">
            Una plataforma integral que conecta a padres, profesores y
            administradores para facilitar el seguimiento académico y la
            comunicación en la comunidad educativa.
          </p>
          <Link
            href="/login"
            className="mt-10 px-10 py-3.5 text-base font-medium text-white bg-black rounded-[25px] hover:bg-gray-800 transition-all"
          >
            Comenzar ahora
          </Link>
        </section>

        <section className="border-t border-gray-100">
          <div className="max-w-5xl mx-auto px-6 py-24">
            <h2 className="text-2xl font-bold text-center text-black tracking-tight">
              ¿Por qué elegir EduConecta?
            </h2>
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="flex flex-col items-center text-center p-8 border border-gray-100 rounded-[25px] bg-white"
                >
                  <h3 className="text-base font-semibold text-black">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-gray-100 bg-gradient-to-b from-green-50/40 to-white">
          <div className="max-w-6xl mx-auto px-6 py-24">
            <div className="text-center max-w-2xl mx-auto">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full">
                <IconClient icon="lucide:leaf" className="size-3.5" />
                Impacto ambiental
              </span>
              <h2 className="mt-6 text-2xl font-bold text-black tracking-tight">
                Educación digital para un futuro sostenible
              </h2>
              <p className="mt-3 text-sm text-gray-400 leading-relaxed">
                Cada hoja de papel que ahorramos es un paso hacia la conservación de la Amazonía peruana.
                Al digitalizar la gestión escolar, reducimos la tala de árboles y protegemos nuestro pulmón verde.
              </p>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {impactCards.map((card) => (
                <Card
                  key={card.title}
                  className={`flex-col items-center text-center p-8 border rounded-[25px] ${card.color} border-transparent`}
                >
                  <div className={`size-12 rounded-xl flex items-center justify-center ${card.iconColor} bg-white/60`}>
                    <IconClient icon={card.icon} className="size-6" />
                  </div>
                  <p className="mt-4 text-3xl font-bold text-black">
                    {card.value?.toLocaleString("es-PE")}
                    <span className="text-sm font-normal text-gray-400">{card.suffix}</span>
                  </p>
                  <p className="mt-2 text-sm font-semibold text-black">
                    {card.title}
                  </p>
                  <p className="mt-2 text-xs text-gray-400 leading-relaxed max-w-[220px]">
                    {card.description}
                  </p>
                </Card>
              ))}
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
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
                    <strong>{institutionCount > 0 ? institutionCount : "más de 0"} instituciones activas</strong>,
                    juntos podemos evitar la tala de{" "}
                    <strong>{treesSaved.toLocaleString("es-PE")} árboles al año</strong>{" "}
                    y preservar la selva peruana para las futuras generaciones.
                  </p>
                </div>
              </Card>

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
                      className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-black rounded-[25px] hover:bg-gray-800 transition-all"
                    >
                      Suma tu institución
                      <IconClient icon="lucide:arrow-right" className="size-4" />
                    </Link>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} EduConecta. Todos los derechos reservados.
      </footer>
    </div>
  )
}
