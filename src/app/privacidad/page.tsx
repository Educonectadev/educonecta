import type { Metadata } from "next"
import Link from "next/link"
import LegalLayout from "@/components/legal/LegalLayout"

export const metadata: Metadata = {
  title: "Política de Privacidad — EduConecta",
  description:
    "Cómo recopilamos, usamos y protegemos los datos personales en EduConecta.",
}

export default function PrivacidadPage() {
  return (
    <LegalLayout>
      <article className="max-w-3xl w-full mx-auto px-6 pt-[160px] pb-12 text-black/60 dark:text-white/70">
        <Link
          href="/"
          className="text-xs text-gray-500 dark:text-zinc-400 hover:underline"
        >
          ← Volver al inicio
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white/90">
          Política de Privacidad
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
          Última actualización: {new Date().toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <Section title="Datos que recopilamos">
          <ul>
            <li>
              <strong>Cuenta:</strong> nombre, correo electrónico, teléfono (opcional) y rol.
            </li>
            <li>
              <strong>Institución:</strong> nombre, datos de contacto y configuración académica.
            </li>
            <li>
              <strong>Académicos:</strong> cursos, grados, secciones, calificaciones, asistencia, tareas y comunicaciones generadas dentro de la plataforma.
            </li>
            <li>
              <strong>Técnicos:</strong> dirección IP, agente de navegador y registros de uso para fines de seguridad y mejora del servicio.
            </li>
          </ul>
        </Section>

        <Section title="Uso de los datos">
          <p>
            Los datos se utilizan exclusivamente para operar el servicio educativo: gestionar
            la cuenta, autenticar accesos, registrar actividad académica, enviar notificaciones
            del servicio y cumplir obligaciones legales. No vendemos ni cedemos datos personales
            a terceros con fines comerciales.
          </p>
        </Section>

        <Section title="Compartir información">
          <p>
            Los datos solo se comparten con: (i) la institución educativa a la que pertenece el
            usuario; (ii) proveedores de infraestructura que actúan como encargados de tratamiento
            (Supabase, Vercel); (iii) autoridades cuando exista obligación legal. Todos los
            proveedores firman acuerdos de tratamiento de datos.
          </p>
        </Section>

        <Section title="Retención">
          <p>
            Conservamos los datos mientras la cuenta esté activa. Al solicitar la eliminación,
            los datos personales se borran en un plazo máximo de 30 días, salvo aquellos que la
            ley obligue a conservar.
          </p>
        </Section>

        <Section title="Derechos del titular">
          <p>
            Puedes ejercer los derechos de acceso, rectificación, cancelación, oposición,
            portabilidad y revocación del consentimiento escribiendo a{" "}
            <a className="underline" href="mailto:privacidad@educonecta.pe">
              privacidad@educonecta.pe
            </a>
            .
          </p>
        </Section>

        <Section title="Datos de menores">
          <p>
            El registro de estudiantes se realiza exclusivamente a través de sus padres,
            madres, tutores legales o la institución educativa. EduConecta no recaba datos de
            menores directamente y aplica controles reforzados de minimización.
          </p>
        </Section>
      </article>
    </LegalLayout>
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