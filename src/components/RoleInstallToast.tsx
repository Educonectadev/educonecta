"use client"

import { useState, useEffect } from "react"
import { useSession } from "@/lib/auth-context"
import { getDeferredPrompt, onDeferredPrompt } from "@/lib/deferred-prompt"
import { getInstallRoleBySlug } from "@/lib/install-roles"

const roleSlugMap: Record<string, string> = {
  SUPER_ADMIN: "developer",
  INSTITUTIONAL_ADMIN: "director",
  TEACHER: "docente",
  PARENT: "padres",
  STUDENT: "alumnos",
}

type Platform = "win" | "mac" | "linux"

const allPlatforms: Platform[] = ["win", "mac", "linux"]

const platformLabels: Record<Platform, string> = {
  win: "Windows",
  mac: "macOS",
  linux: "Linux",
}

const platformExtensions: Record<Platform, string> = {
  win: "-setup.exe",
  mac: ".dmg",
  linux: ".AppImage",
}

function detectOS(): Platform | "other" {
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

const DISMISS_PREFIX = "ec-role-toast-dismissed-"

function PlatformIcon({ platform }: { platform: Platform }) {
  if (platform === "win") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    )
  }
  if (platform === "mac") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    )
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
      <path d="M4 16v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
      <path d="M12 2v8" />
      <path d="M8 10h8" />
      <path d="M8 14h8" />
      <path d="M8 18h8" />
    </svg>
  )
}

export default function RoleInstallToast() {
  const { data: session, status } = useSession()
  const [visible, setVisible] = useState(false)
  const [deferredPrompt, setDeferredState] = useState<any>(null)
  const [installed, setInstalled] = useState(false)
  const [downloading, setDownloading] = useState<Platform | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [available, setAvailable] = useState<Platform[] | null>(null)

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true)
      return
    }
    const existing = getDeferredPrompt()
    if (existing) setDeferredState(existing)
    const unsub = onDeferredPrompt((p) => setDeferredState(p))
    const installedHandler = () => setInstalled(true)
    window.addEventListener("appinstalled", installedHandler)
    return () => {
      unsub()
      window.removeEventListener("appinstalled", installedHandler)
    }
  }, [])

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.role || installed) return
    const slug = roleSlugMap[session.user.role]
    if (!slug) return
    if (localStorage.getItem(DISMISS_PREFIX + slug) === "true") return
    const timer = setTimeout(() => setVisible(true), 2000)
    return () => clearTimeout(timer)
  }, [status, session, installed])

  const slug = session?.user?.role ? roleSlugMap[session.user.role] : undefined
  const config = slug ? getInstallRoleBySlug(slug) : undefined
  const mobile = isMobile()
  const detectedOS = detectOS()

  useEffect(() => {
    if (!visible || !config || mobile) return
    const electronRole = config.electronRole
    let cancelled = false
    async function check() {
      const results: Platform[] = []
      for (const p of allPlatforms) {
        try {
          const res = await fetch(`/api/download/public/${electronRole}?platform=${p}&check=1`)
          if (cancelled) return
          if (res.ok) {
            const data = await res.json()
            if (data.available) results.push(p)
          }
        } catch { /* ignore */ }
      }
      if (!cancelled) setAvailable(results)
    }
    check()
    return () => { cancelled = true }
  }, [visible, config, mobile])

  function dismiss(permanent = false) {
    setVisible(false)
    setError(null)
    if (permanent && slug) {
      localStorage.setItem(DISMISS_PREFIX + slug, "true")
    }
  }

  async function handlePwaInstall() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") {
      setDeferredState(null)
      setInstalled(true)
      setVisible(false)
      if (slug) localStorage.setItem(DISMISS_PREFIX + slug, "true")
    }
  }

  async function handleDownload(platform: Platform) {
    if (!config) return
    setDownloading(platform)
    setError(null)
    try {
      const res = await fetch(`/api/download/public/${config.electronRole}?platform=${platform}`)
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Error al descargar" }))
        throw new Error(data.error || "Error al descargar")
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `educonecta-${config.electronRole}${platformExtensions[platform]}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al descargar")
    } finally {
      setDownloading(null)
    }
  }

  if (status !== "authenticated" || !config || installed) return null
  if (!visible) return null

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 left-4 md:left-auto md:right-8 z-50 mx-auto md:mx-0 max-w-sm animate-fade-in">
      <div className="sa-surface shadow-lg p-4 rounded-2xl border border-[var(--surface-border)]">
        {error && (
          <div className="mb-3 px-3 py-2 rounded-xl text-xs text-red-500 dark:text-red-400 bg-red-500/10 border border-red-500/20 text-center">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 8V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
              <path d="M4 16v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
              <path d="M12 2v8" />
              <path d="M8 10h8" />
              <path d="M8 14h8" />
              <path d="M8 18h8" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{config.title}</p>
            <p className="text-xs text-muted-foreground">
              {mobile
                ? "Instala la app en tu dispositivo"
                : `Descarga el instalador nativo`}
            </p>
          </div>

          {mobile ? (
            deferredPrompt ? (
              <button
                onClick={handlePwaInstall}
                className="sa-btn sa-btn-primary text-xs px-3 py-1.5 shrink-0"
              >
                Instalar
              </button>
            ) : (
              <span className="text-[10px] text-muted-foreground max-w-28 text-right leading-tight shrink-0">
                {isIOS()
                  ? 'Compartir → "Agregar a pantalla de inicio"'
                  : 'Menú → "Instalar app"'}
              </span>
            )
          ) : (
            <div className="flex items-center gap-1 shrink-0">
              {available === null ? (
                <span className="text-[10px] text-muted-foreground">Verificando...</span>
              ) : available.length === 0 ? (
                <span className="text-[10px] text-muted-foreground">No disponible</span>
              ) : detectedOS !== "other" && available.includes(detectedOS) ? (
                <button
                  onClick={() => handleDownload(detectedOS)}
                  disabled={downloading !== null}
                  className="sa-btn sa-btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5 disabled:opacity-60"
                >
                  {downloading === detectedOS ? (
                    <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  )}
                  {downloading === detectedOS ? "" : platformLabels[detectedOS]}
                </button>
              ) : (
                <div className="flex gap-1">
                  {available.map((p) => (
                    <button
                      key={p}
                      onClick={() => handleDownload(p)}
                      disabled={downloading !== null}
                      className="sa-btn sa-btn-outline text-[10px] px-2 py-1 flex items-center gap-1 disabled:opacity-60"
                    >
                      <PlatformIcon platform={p} />
                      {platformLabels[p]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => dismiss(false)}
            className="text-muted-foreground hover:text-foreground shrink-0 p-0.5"
            aria-label="Cerrar"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-center mt-2">
          <button
            onClick={() => dismiss(true)}
            className="text-[10px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          >
            No volver a mostrar
          </button>
        </div>
      </div>
    </div>
  )
}
