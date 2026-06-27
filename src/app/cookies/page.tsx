import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Política de Cookies — EduConecta",
  description: "Cómo usamos cookies y tecnologías similares en EduConecta.",
}

export default function CookiesPage() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      <Link
        href="/"
        className="text-xs text-gray-500 dark:text-zinc-400 hover:underline"
      >
        ← Volver al inicio
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white/90">
        Política de Cookies
      </h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
        Última actualización: {new Date().toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" })}
      </p>

      <Section title="¿Qué son las cookies?">
        <p>
          Son pequeños archivos que el navegador almacena en tu dispositivo para recordar
          información entre visitas. EduConecta utiliza cookies estrictamente necesarias
          para el funcionamiento del servicio y, opcionalmente, cookies de preferencia.
        </p>
      </Section>

      <Section title="Cookies que usamos">
        <ul>
          <li>
            <strong>Sesión:</strong> mantienen iniciada la sesión del usuario.
          </li>
          <li>
            <strong>Tema:</strong> recuerdan si prefieres el modo claro u oscuro.
          </li>
          <li>
            <strong>Seguridad:</strong> ayudan a detectar accesos sospechosos.
          </li>
        </ul>
      </Section>

      <Section title="Cookies de terceros">
        <p>
          No utilizamos cookies publicitarias ni de seguimiento de terceros. Los proveedores
          de infraestructura (Supabase, Vercel) pueden colocar cookies estrictamente
          necesarias para prestar el servicio.
        </p>
      </Section>

      <Section title="Gestión">
        <p>
          Puedes bloquear o eliminar cookies desde la configuración de tu navegador. Ten en
          cuenta que deshabilitar las cookies estrictamente necesarias puede impedir el
          correcto funcionamiento de la plataforma.
        </p>
      </Section>
    </article>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 space-y-3">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white/90">{title}</h2>
      <div className="text-sm leading-relaxed text-gray-600 dark:text-zinc-300 space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
        {children}
      </div>
    </section>
  )
}