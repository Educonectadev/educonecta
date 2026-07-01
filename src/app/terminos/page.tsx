import type { Metadata } from "next"
import Link from "next/link"
import LegalLayout from "@/components/legal/LegalLayout"

export const metadata: Metadata = {
  title: "Términos y Condiciones — EduConecta",
  description: "Reglas de uso de la plataforma EduConecta.",
}

export default function TerminosPage() {
  return (
    <LegalLayout>
      <article className="max-w-3xl w-full mx-auto px-6 pt-[160px] pb-[160px] text-black/60 dark:text-white/70">
        <Link
          href="/"
          className="text-xs text-gray-500 dark:text-zinc-400 hover:underline"
        >
          ← Volver al inicio
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white/90">
          Términos y Condiciones
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
          Última actualización: {new Date().toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <Section title="Aceptación">
          <p>
            Al crear una cuenta o utilizar EduConecta, el usuario acepta estos términos.
            Si no está de acuerdo, debe abstenerse de usar la plataforma.
          </p>
        </Section>

        <Section title="Uso permitido">
          <ul>
            <li>La plataforma está destinada a fines educativos legítimos.</li>
            <li>Cada usuario es responsable de mantener la confidencialidad de sus credenciales.</li>
            <li>Está prohibido suplantar identidades, alterar registros académicos o intentar acceder a datos de otros usuarios.</li>
          </ul>
        </Section>

        <Section title="Cuentas institucionales">
          <p>
            El administrador institucional es responsable de registrar correctamente a los
            miembros de su comunidad y de revocar el acceso de quienes dejen de pertenecer
            a ella.
          </p>
        </Section>

        <Section title="Propiedad intelectual">
          <p>
            El software, marca, diseño y contenidos de EduConecta están protegidos por las
            leyes de propiedad intelectual. Los datos académicos pertenecen a la institución
            educativa que los genera.
          </p>
        </Section>

        <Section title="Limitación de responsabilidad">
          <p>
            EduConecta presta el servicio con una disponibilidad objetivo del 99.5% mensual,
            excluyendo mantenimientos programados y causas de fuerza mayor. No nos
            responsabilizamos por daños derivados del uso indebido de las credenciales.
          </p>
        </Section>

        <Section title="Suspensión y terminación">
          <p>
            Podemos suspender o cancelar cuentas que incumplan estos términos o que
            representen un riesgo de seguridad. El usuario puede solicitar la cancelación
            de su cuenta en cualquier momento.
          </p>
        </Section>

        <Section title="Modificaciones">
          <p>
            Estos términos pueden actualizarse. Los cambios sustantivos se comunicarán al
            usuario con al menos 15 días de anticipación.
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