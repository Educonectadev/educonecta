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
type PlatformType = "windows" | "macos" | "linux" | "android" | "ios" | "other"

const platformExtensions: Record<Platform, string> = {
  win: "-setup.exe",
  mac: ".dmg",
  linux: ".AppImage",
}

const desktopPlatforms: PlatformType[] = ["windows", "macos", "linux"]

function detectPlatform(): PlatformType {
  if (typeof navigator === "undefined") return "other"
  const ua = navigator.userAgent
  if (ua.includes("Windows")) return "windows"
  if (ua.includes("Android")) return "android"
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios"
  if (ua.includes("Mac")) return "macos"
  if (ua.includes("Linux")) return "linux"
  return "other"
}

function platformToDownload(p: PlatformType): Platform | null {
  if (p === "windows") return "win"
  if (p === "macos") return "mac"
  if (p === "linux") return "linux"
  return null
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone === true
}

const DISMISS_PREFIX = "ec-role-toast-dismissed-"

const platformLabel: Record<PlatformType, string> = {
  windows: "Windows",
  macos: "macOS",
  linux: "Linux",
  android: "Android",
  ios: "iOS",
  other: "",
}

export default function RoleInstallToast() {
  const { data: session, status } = useSession()
  const [visible, setVisible] = useState(false)
  const [deferredPrompt, setDeferredState] = useState<any>(null)
  const [installed, setInstalled] = useState(false)
  const [downloading, setDownloading] = useState<Platform | null>(null)
  const [nativeAvailable, setNativeAvailable] = useState<boolean | null>(null)

  const platform = detectPlatform()
  const isDesktop = desktopPlatforms.includes(platform)
  const isAndroid = platform === "android"
  const isIOS = platform === "ios"

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

  useEffect(() => {
    if (!visible || !config || !isDesktop) return
    setNativeAvailable(null)
    const dl = platformToDownload(platform)
    if (!dl) return
    let cancelled = false
    async function check() {
      try {
        const res = await fetch(`/api/download/public/${config.electronRole}?platform=${dl}&check=1`)
        if (cancelled) return
        const data = await res.json()
        if (!cancelled) setNativeAvailable(!!data.available)
      } catch {
        if (!cancelled) setNativeAvailable(false)
      }
    }
    check()
    return () => { cancelled = true }
  }, [visible, config, isDesktop, platform])

  function dismiss(permanent = false) {
    setVisible(false)
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

  async function handleDownload() {
    if (!config) return
    const dl = platformToDownload(platform)
    if (!dl) return
    setDownloading(dl)
    try {
      const res = await fetch(`/api/download/public/${config.electronRole}?platform=${dl}`)
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Error al descargar" }))
        throw new Error(data.error || "Error al descargar")
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `educonecta-${config.electronRole}${platformExtensions[dl]}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      setNativeAvailable(false)
    } finally {
      setDownloading(null)
    }
  }

  if (status !== "authenticated" || !config || installed) return null
  if (!visible) return null

  const usePwa = isAndroid || isIOS || (isDesktop && nativeAvailable === false)
  const useNative = isDesktop && nativeAvailable === true
  const checkingNative = isDesktop && nativeAvailable === null

  const subtitle = useNative
    ? `Descargar para ${platformLabel[platform]}`
    : isAndroid
      ? "Instala la app desde el navegador"
      : isIOS
        ? "Añade la app a tu pantalla de inicio"
        : checkingNative
          ? "Verificando disponibilidad..."
          : "Instala la app desde el navegador"

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 left-4 md:left-auto md:right-8 z-50 mx-auto md:mx-0 max-w-sm animate-fade-in">
      <div className="sa-surface shadow-lg p-4 rounded-2xl border border-[var(--surface-border)]">
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
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>

          {useNative ? (
            <button
              onClick={handleDownload}
              disabled={downloading !== null}
              className="sa-btn sa-btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5 shrink-0 disabled:opacity-60"
            >
              {downloading ? (
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
              {platformLabel[platform]}
            </button>
          ) : usePwa ? (
            deferredPrompt ? (
              <button
                onClick={handlePwaInstall}
                className="sa-btn sa-btn-primary text-xs px-3 py-1.5 shrink-0"
              >
                Instalar aplicación
              </button>
            ) : (
              <span className="text-[10px] text-muted-foreground max-w-32 text-right leading-tight shrink-0">
                {isIOS
                  ? 'Compartir → "Añadir a pantalla de inicio"'
                  : 'Menú → "Instalar app"'}
              </span>
            )
          ) : null}

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
