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

export default function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
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
            className="fixed inset-0 z-50 md:hidden"
          >
            <div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute right-0 top-0 bottom-0 w-72 bg-white dark:bg-zinc-900 shadow-xl flex flex-col"
            >
              <div className="flex items-center justify-between px-5 h-14 border-b border-gray-100 dark:border-zinc-800">
                <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                  <Logo size={22} className="text-black dark:text-white/90" />
                  <span className="text-base font-bold tracking-tight text-black dark:text-white/90">EduConecta</span>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-lg text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                  aria-label="Cerrar menú"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 py-4 px-3">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-sm font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="px-5 py-4 border-t border-gray-100 dark:border-zinc-800">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center px-4 py-2.5 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-black rounded-xl hover:opacity-90 transition-opacity"
                >
                  Iniciar sesión
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
