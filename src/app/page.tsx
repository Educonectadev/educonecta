import Link from "next/link"

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

export default function Home() {
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
      </main>

      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} EduConecta. Todos los derechos reservados.
      </footer>
    </div>
  )
}
