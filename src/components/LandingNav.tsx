"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import ThemeToggle from "@/components/ThemeToggle"
import Logo from "@/components/Logo"

const links = [
  { href: "/funcionalidades", label: "Funcionalidades" },
  { href: "/planes", label: "Planes" },
  { href: "/contacto", label: "Contacto" },
]

const roleLinks = [
  { href: "/rol/dev", label: "Dev" },
  { href: "/rol/director", label: "Director" },
  { href: "/rol/docente", label: "Docente" },
  { href: "/rol/padre", label: "Padre" },
  { href: "/rol/alumno", label: "Alumno" },
]

export default function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (mobileOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = "hidden"
      document.body.style.paddingRight = `${scrollbarWidth}px`
    } else {
      document.body.style.overflow = ""
      document.body.style.paddingRight = ""
    }
    return () => {
      document.body.style.overflow = ""
      document.body.style.paddingRight = ""
    }
  }, [mobileOpen])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-4">
        <nav className="flex items-center justify-between w-full max-w-7xl mx-auto mt-3 px-4 sm:px-6 h-14 rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-gray-200/60 dark:border-zinc-700/60 shadow-sm">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Logo size={20} className="text-black dark:text-white/90" />
            <span className="text-base font-bold tracking-tight text-black dark:text-white/90">EduConecta</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="w-px h-5 bg-gray-200 dark:bg-zinc-700 mx-1" />
            {roleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(true)}
              className="flex md:hidden p-2 rounded-lg text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Abrir menú"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:hidden"
          >
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/60 dark:border-zinc-700/60 shadow-2xl shadow-black/10 overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                  <Logo size={22} className="text-black dark:text-white/90" />
                  <span className="text-base font-bold tracking-tight text-black dark:text-white/90">EduConecta</span>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="size-8 flex items-center justify-center rounded-full text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                  aria-label="Cerrar menú"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>

              <div className="px-3 py-2 space-y-0.5">
                <p className="px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">
                  Páginas
                </p>
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-800/80 rounded-2xl transition-colors"
                  >
                    <span>{link.label}</span>
                  </Link>
                ))}
                <div className="mx-4 my-2 h-px bg-gray-100 dark:bg-zinc-800" />
                <p className="px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">
                  Roles
                </p>
                {roleLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-800/80 rounded-2xl transition-colors"
                  >
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>

              <div className="px-5 pb-5 pt-3">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-semibold text-white bg-gray-900 dark:bg-white dark:text-black rounded-2xl hover:opacity-90 transition-opacity"
                >
                  Iniciar sesión
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
