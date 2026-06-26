"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import IconClient from "@/components/IconClient"
import ThemeToggle from "@/components/ThemeToggle"
import { useSession } from "@/lib/auth-context"

export default function LoginPage() {
  const router = useRouter()
  const { signIn } = useSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const { error: signInError } = await signIn(email, password)

    if (signInError) {
      setError("Credenciales inválidas. Intenta de nuevo.")
      setLoading(false)
      return
    }

    router.push("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-black">
      <div className="relative px-6 py-6 max-w-6xl mx-auto w-full flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-zinc-500 hover:text-black dark:hover:text-white transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Volver
        </Link>
        <ThemeToggle />
      </div>

      <main className="flex flex-1 items-center justify-center px-6 pb-20">
        <div className="w-full max-w-sm">
          <div className="text-center">
            <div className="size-14 rounded-2xl bg-black dark:bg-white flex items-center justify-center mx-auto">
              <IconClient icon="lucide:graduation-cap" className="size-7 text-white dark:text-black" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-black dark:text-white/90 tracking-tight">
              Iniciar Sesión
            </h1>
            <p className="mt-1.5 text-sm text-gray-400 dark:text-zinc-500">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-500 dark:text-zinc-400 mb-1.5">
                Correo electrónico
              </label>
              <div className="relative mt-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-zinc-600 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-[30px] border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-11 pr-5 py-3 text-sm text-black dark:text-white/90 placeholder:text-gray-300 dark:placeholder:text-zinc-600 focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-500 dark:text-zinc-400 mb-1.5">
                Contraseña
              </label>
              <div className="relative mt-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-zinc-600 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-[30px] border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-11 pr-12 py-3 text-sm text-black dark:text-white/90 placeholder:text-gray-300 dark:placeholder:text-zinc-600 focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-[30px] px-5 py-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[25px] btn-primary px-4 py-3.5 text-sm font-medium duration-200 inline-flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin size-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Ingresando...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400 dark:text-zinc-500">
            ¿No tienes cuenta? Contacta a tu institución educativa.
          </p>
        </div>
      </main>
    </div>
  )
}
