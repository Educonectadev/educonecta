"use client"

import { useState, FormEvent, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useSession } from "@/lib/auth-context"

export default function SuperAdminRegisterPage() {
  const router = useRouter()
  const { status } = useSession()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard")
    }
  }, [status, router])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al registrar")
        setLoading(false)
        return
      }

      router.push("/login")
    } catch {
      setError("Error de conexión")
      setLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <p className="text-gray-400 dark:text-zinc-500">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-black">
      <header className="px-8 py-5 max-w-6xl mx-auto w-full">
        <Link href="/" className="text-lg font-bold tracking-tight text-black dark:text-white">
          EduConecta
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-black dark:text-white text-center tracking-tight">
            Registrar Super Admin
          </h1>
          <p className="mt-2 text-center text-sm text-gray-400 dark:text-zinc-500">
            Crea la cuenta principal del sistema
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-500 dark:text-zinc-400 mb-1.5">
                Nombre completo
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-[30px] border border-gray-200 dark:border-zinc-700 px-5 py-3 text-sm text-black dark:text-white/90 placeholder:text-gray-300 dark:placeholder:text-zinc-600 focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
                placeholder="Super Administrador"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-500 dark:text-zinc-400 mb-1.5">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-[30px] border border-gray-200 dark:border-zinc-700 px-5 py-3 text-sm text-black dark:text-white/90 placeholder:text-gray-300 dark:placeholder:text-zinc-600 focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
                placeholder="super@educonecta.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-500 dark:text-zinc-400 mb-1.5">
                Contraseña
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-[30px] border border-gray-200 dark:border-zinc-700 px-5 py-3 pr-12 text-sm text-black dark:text-white/90 placeholder:text-gray-300 dark:placeholder:text-zinc-600 focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="badge-red text-sm rounded-[30px] px-5 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[25px] btn-primary px-4 py-3.5 text-sm font-medium"
            >
              {loading ? "Registrando..." : "Crear Super Admin"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400 dark:text-zinc-500">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-black dark:text-white underline underline-offset-4 hover:text-gray-600 dark:hover:text-zinc-300">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
