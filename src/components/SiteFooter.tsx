"use client"

import Link from "next/link"

interface FooterLink {
  href: string
  label: string
}

const securityLinks: FooterLink[] = [
  { href: "/seguridad", label: "Seguridad" },
  { href: "/privacidad", label: "Política de Privacidad" },
  { href: "/terminos", label: "Términos y Condiciones" },
  { href: "/cookies", label: "Política de Cookies" },
]

const productLinks: FooterLink[] = [
  { href: "/funcionalidades", label: "Funcionalidades" },
  { href: "/planes", label: "Planes" },
  { href: "/contacto", label: "Contacto" },
]

export default function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer
      aria-labelledby="footer-heading"
      className="border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900"
    >
      <h2 id="footer-heading" className="sr-only">
        Pie de página
      </h2>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 items-start">
          <div className="space-y-2">
            <p className="text-sm font-bold tracking-tight text-gray-900 dark:text-white/90">
              EduConecta
            </p>
            <p className="text-xs text-gray-500 dark:text-zinc-500 max-w-xs leading-relaxed">
              Plataforma educativa para instituciones, docentes, estudiantes y familias.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">
              Seguridad y Políticas
            </p>
            <ul className="space-y-1.5">
              {securityLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-xs text-gray-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">
              Producto
            </p>
            <ul className="space-y-1.5">
              {productLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-xs text-gray-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-gray-400 dark:text-zinc-500">
            © {year} EduConecta. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-zinc-500">
              <span
                aria-hidden
                className="size-1.5 rounded-full bg-emerald-500"
              />
              Datos cifrados en reposo y en tránsito
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}