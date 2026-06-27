import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Seguridad — EduConecta",
  description:
    "Cómo protegemos los datos y la privacidad de instituciones, docentes, estudiantes y familias en EduConecta.",
}

export default function SeguridadPage() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      <Link
        href="/"
        className="text-xs text-gray-500 dark:text-zinc-400 hover:underline"
      >
        ← Volver al inicio
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white/90">
        Seguridad
      </h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
        Última actualización: {new Date().toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" })}
      </p>

      <Section title="Compromiso">
        <p>
          EduConecta trata los datos educativos con un estándar equivalente al de plataformas
          de salud y finanzas. Toda la información personal de menores está especialmente
          protegida conforme a la normativa aplicable (Ley N.° 29733 — Ley de Protección de
          Datos Personales del Perú y, cuando corresponde, COPPA / GDPR).
        </p>
      </Section>

      <Section title="Cifrado">
        <ul>
          <li>
            <strong>En tránsito:</strong> TLS 1.2+ en todas las conexiones entre navegadores,
            dispositivos móviles y nuestros servidores.
          </li>
          <li>
            <strong>En reposo:</strong> AES-256 sobre todas las bases de datos y respaldos.
          </li>
          <li>
            <strong>Contraseñas:</strong> hash con bcrypt (cost 10); nunca se almacenan en
            texto plano.
          </li>
        </ul>
      </Section>

      <Section title="Autenticación y acceso">
        <ul>
          <li>Autenticación gestionada por Supabase Auth con tokens JWT firmados.</li>
          <li>Sesiones con expiración configurable y revocación remota.</li>
          <li>Control de acceso por rol (Institutional Admin, Docente, Padre/Madre, Estudiante).</li>
          <li>Contraseñas se pueden restablecer solo mediante enlace de un solo uso enviado al correo registrado.</li>
        </ul>
      </Section>

      <Section title="Infraestructura">
        <ul>
          <li>Alojamiento en Supabase (PostgreSQL) sobre infraestructura con redundancia geográfica.</li>
          <li>Copias de seguridad automáticas diarias y restauraciones verificadas periódicamente.</li>
          <li>Registro de auditoría para acciones administrativas sensibles (creación de usuarios, asignación de cursos, exportación de datos).</li>
        </ul>
      </Section>

      <Section title="Reportar un incidente">
        <p>
          Si detectas una vulnerabilidad o un incidente de seguridad, escríbenos a{" "}
          <a className="underline" href="mailto:security@educonecta.pe">
            security@educonecta.pe
          </a>
          . Acusaremos recibo en menos de 48 horas hábiles.
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