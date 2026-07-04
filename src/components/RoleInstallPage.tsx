"use client"

import { useState, useEffect } from "react"
import { onDeferredPrompt, getDeferredPrompt } from "@/lib/deferred-prompt"
import type { InstallRoleConfig } from "@/lib/install-roles"

function detectPlatform(): "win" | "mac" | "linux" | "other" {
  if (typeof navigator === "undefined") return "other"
  const ua = navigator.userAgent
  if (ua.includes("Windows")) return "win"
  if (ua.includes("Mac")) return "mac"
  if (ua.includes("Linux")) return "linux"
  return "other"
}

function isMobile(): boolean {
  if (typeof navigator === "undefined") return false
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone === true
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

export default function RoleInstallPage({ config }: { config: InstallRoleConfig }) {
  const [prompt, setPrompt] = useState<any>(null)
  const [installed, setInstalled] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const platform = detectPlatform()
  const mobile = isMobile()

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true)
      return
    }

    const existing = getDeferredPrompt()
    if (existing) setPrompt(existing)
    const unsub = onDeferredPrompt((p) => setPrompt(p))

    const installedHandler = () => setInstalled(true)
    window.addEventListener("appinstalled", installedHandler)
    return () => {
      unsub()
      window.removeEventListener("appinstalled", installedHandler)
    }
  }, [])

  async function handlePwaInstall() {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === "accepted") {
      setPrompt(null)
      setInstalled(true)
    }
  }

  function handleDownload() {
    setDownloading(true)
    const p = platform === "other" ? "win" : platform
    window.location.href = `/api/download/public/${config.electronRole}?platform=${p}`
  }

  const platformLabel =
    platform === "win" ? "Windows" : platform === "mac" ? "macOS" : platform === "linux" ? "Linux" : "tu dispositivo"

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col">
      <div className="px-6 py-6 max-w-6xl mx-auto w-full flex items-center justify-between">
        <a
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-zinc-500 hover:text-black dark:hover:text-white transition-colors duration-200"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path d="m12 16-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Volver al dashboard
        </a>
      </div>

      <main className="flex-1 max-w-6xl mx-auto px-6 pb-20 w-full">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 sa-eyebrow">
            {config.name}
          </p>

          <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white font-display">
            {config.title}
          </h1>

          <p className="mt-4 text-lg text-gray-500 dark:text-zinc-400 max-w-lg">
            {config.description}
          </p>

          <ul className="mt-8 space-y-3">
            {config.features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-gray-700 dark:text-zinc-300">
                <svg className="size-5 shrink-0 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
                {f}
              </li>
            ))}
          </ul>

          <div className="mt-10 space-y-6">
            {mobile ? (
              <>
                {installed ? (
                  <div className="sa-surface p-6">
                    <p className="text-sm font-semibold text-foreground">App instalada</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Abre {config.name} desde tu pantalla de inicio.
                    </p>
                    <a
                      href="/login"
                      className="sa-btn sa-btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm mt-4"
                    >
                      Ir al inicio de sesión
                    </a>
                  </div>
                ) : prompt ? (
                  <div className="sa-surface p-6">
                    <p className="text-sm font-semibold text-foreground">Instalar {config.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Se instalará en tu dispositivo como una app.
                    </p>
                    <button
                      onClick={handlePwaInstall}
                      className="sa-btn sa-btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm mt-4"
                    >
                      Instalar aplicación
                    </button>
                  </div>
                ) : (
                  <div className="sa-surface p-6">
                    <p className="text-sm font-semibold text-foreground">Instalar {config.name}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {isIOS()
                        ? `Presiona Compartir y luego "Agregar a pantalla de inicio".`
                        : 'Abre el menú del navegador y selecciona "Instalar app".'}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="sa-surface p-6">
                <p className="text-sm font-semibold text-foreground">
                  Descargar para {platformLabel}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Instalador nativo para {platformLabel}. Recomendado para mejor rendimiento.
                </p>
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="sa-btn sa-btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm mt-4 disabled:opacity-50"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 8V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
                    <path d="M4 16v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
                    <path d="M12 2v8" />
                    <path d="M8 10h8" />
                    <path d="M8 14h8" />
                    <path d="M8 18h8" />
                  </svg>
                  {downloading ? "Descargando..." : `Descargar ${config.name}`}
                </button>

                {prompt && (
                  <div className="mt-4 pt-4 sa-divider">
                    <p className="text-xs text-muted-foreground">
                      ¿Prefieres la versión web?{" "}
                      <button onClick={handlePwaInstall} className="text-[var(--accent)] hover:underline">
                        Instalar app web
                      </button>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
