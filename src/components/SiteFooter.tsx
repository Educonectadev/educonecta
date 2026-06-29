"use client"

import Link from "next/link"
import { useState } from "react"

const productLinks = [
  { href: "/funcionalidades", label: "Funcionalidades" },
  { href: "/planes", label: "Planes" },
  { href: "/contacto", label: "Contacto" },
  { href: "/login", label: "Iniciar Sesión" },
]

const legalLinks = [
  { href: "/privacidad", label: "Política de Privacidad" },
  { href: "/terminos", label: "Términos y Condiciones" },
  { href: "/cookies", label: "Política de Cookies" },
  { href: "/seguridad", label: "Seguridad" },
]

const socialLinks = [
  { href: "#", label: "Facebook", icon: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" },
  { href: "#", label: "Twitter", icon: "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" },
  { href: "#", label: "Instagram", icon: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" },
  { href: "#", label: "LinkedIn", icon: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" },
]

const year = new Date().getFullYear()

function SocialIcon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
      <path d={path} />
    </svg>
  )
}

export default function SiteFooter() {
  const [email, setEmail] = useState("")

  return (
    <footer aria-labelledby="footer-heading" className="bg-white dark:bg-black border-t border-gray-100 dark:border-zinc-800 transition-colors">
      <h2 id="footer-heading" className="sr-only">Pie de página</h2>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-0 overflow-hidden">
        <div className="flex flex-wrap justify-between gap-y-12 lg:gap-x-8">
          {/* Brand */}
          <div className="w-full md:w-[45%] lg:w-[35%] flex flex-col items-start text-left">
            <Link href="/" className="text-xl font-bold tracking-tight text-black dark:text-white">
              EduConecta
            </Link>
            <div className="w-full max-w-52 h-px mt-8 bg-gradient-to-r from-gray-200 dark:from-zinc-700 to-transparent" />
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-6 max-w-[350px] leading-relaxed">
              Plataforma educativa que conecta a instituciones, docentes, estudiantes y familias para un seguimiento escolar en tiempo real.
            </p>
          </div>

          {/* Producto */}
          <div className="w-[45%] md:w-[45%] lg:w-[15%] flex flex-col items-start text-left">
            <h3 className="text-sm font-medium text-black dark:text-white">Producto</h3>
            <ul className="flex flex-col gap-2 mt-6">
              {productLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="w-[45%] md:w-[45%] lg:w-[15%] flex flex-col items-start text-left">
            <h3 className="text-sm font-medium text-black dark:text-white">Legal</h3>
            <ul className="flex flex-col gap-2 mt-6">
              {legalLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Redes */}
          <div className="w-[45%] md:w-[45%] lg:w-[15%] flex flex-col items-start text-left">
            <h3 className="text-sm font-medium text-black dark:text-white">Redes Sociales</h3>
            <ul className="flex flex-col gap-2 mt-6">
              {socialLinks.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-2">
                    <SocialIcon path={s.icon} />
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="w-full md:w-[45%] lg:w-[25%] flex flex-col items-start text-left mt-4 md:mt-0">
            <h3 className="text-sm font-medium text-black dark:text-white">Suscríbete para novedades</h3>
            <form
              onSubmit={(e) => { e.preventDefault(); setEmail("") }}
              className="flex items-center border border-gray-200 dark:border-zinc-700 h-13 max-w-80 w-full rounded-full overflow-hidden mt-4 focus-within:border-emerald-500 dark:focus-within:border-emerald-400 transition-colors"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full h-full pl-6 outline-none text-sm bg-transparent text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500"
              />
              <button
                type="submit"
                className="bg-black dark:bg-white text-white dark:text-black hover:opacity-90 active:scale-95 transition-all h-10 rounded-full text-sm font-medium cursor-pointer mr-1.5 shrink-0 px-5"
              >
                Suscribir
              </button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px mt-16 mb-4 bg-gradient-to-r from-transparent via-gray-200 dark:via-zinc-700 to-transparent" />

        {/* Bottom bar */}
        <div className="flex flex-wrap sm:flex-row items-center justify-between gap-y-4 gap-x-2 relative z-10">
          <p className="text-xs text-gray-400 dark:text-zinc-500">
            © {year} EduConecta. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-zinc-500">
              <span aria-hidden className="size-1.5 rounded-full bg-emerald-500" />
              Datos cifrados en reposo y en tránsito
            </span>
          </div>
        </div>

        {/* Brand watermark */}
        <div className="w-full flex justify-center mt-6 md:mt-12 md:mb-[-0.5%]">
          <h1 className="text-center font-extrabold tracking-tighter leading-[0.70] text-gray-100 dark:text-zinc-900 text-[clamp(4.5rem,19.5vw,25rem)] pointer-events-none select-none">
            EduConecta
          </h1>
        </div>
      </div>
    </footer>
  )
}
