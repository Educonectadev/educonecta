"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "@/lib/auth-context"
import { getDeferredPrompt, onDeferredPrompt } from "@/lib/deferred-prompt"
import { getInstallRoleBySlug } from "@/lib/install-roles"
import Modal from "./Modal"

const roleSlugMap: Record<string, string> = {
  SUPER_ADMIN: "developer",
  INSTITUTIONAL_ADMIN: "director",
  TEACHER: "docente",
  PARENT: "padres",
  STUDENT: "alumnos",
}

type Platform = "win" | "mac" | "linux"

const allPlatforms: Platform[] = ["win", "mac", "linux"]

const platformExtensions: Record<Platform, string> = {
  win: "-setup.exe",
  mac: ".dmg",
  linux: ".AppImage",
}

const platformLabels: Record<Platform, string> = {
  win: "Windows",
  mac: "macOS",
  linux: "Linux",
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

const DISMISS_PREFIX = "ec-role-modal-dismissed-"

function PlatformIcon({ platform }: { platform: Platform }) {
  if (platform === "win") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    )
  }
  if (platform === "mac") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
      <path d="M4 16v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
      <path d="M12 2v8" />
      <path d="M8 10h8" />
      <path d="M8 14h8" />
      <path d="M8 18h8" />
    </svg>
  )
}

export default function RoleInstallModal() {
  const { data: session, status } = useSession()
  const [open, setOpen] = useState(false)
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

    const dismissed = localStorage.getItem(DISMISS_PREFIX + slug)
    if (dismissed === "true") return

    const timer = setTimeout(() => setOpen(true), 2000)
    return () => clearTimeout(timer)
  }, [status, session, installed])

  const slug = session?.user?.role ? roleSlugMap[session.user.role] : undefined
  const config = slug ? getInstallRoleBySlug(slug) : undefined
  const mobile = isMobile()
  const detectedOS = detectOS()

  useEffect(() => {
    if (!open || !config || mobile) return

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
        } catch {
          // ignore check errors
        }
      }
      if (!cancelled) setAvailable(results)
    }

    check()
    return () => { cancelled = true }
  }, [open, config, mobile])

  function handleClose(permanent = false) {
    setOpen(false)
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
      setOpen(false)
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

  const showDownload =
    !mobile && (available === null || available.length > 0)

  const hasResult =
    available !== null

  return (
    <Modal open={open} onClose={() => handleClose(false)} title={config.name} size="sm">
      <div className="space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/15 flex items-center justify-center shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 8V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
              <path d="M4 16v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
              <path d="M12 2v8" />
              <path d="M8 10h8" />
              <path d="M8 14h8" />
              <path d="M8 18h8" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-foreground">{config.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              {mobile
                ? "Instala la aplicación en tu dispositivo para acceder más rápido."
                : "Descarga el instalador nativo y aprovecha al máximo EduConecta."}
            </p>
          </div>
        </div>

        {mobile ? (
          <div className="space-y-2">
            {deferredPrompt ? (
              <button
                onClick={handlePwaInstall}
                className="sa-btn sa-btn-primary w-full justify-center text-sm py-2.5"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Instalar aplicación
              </button>
            ) : (
              <div className="sa-surface-flat p-3 rounded-2xl text-xs text-muted-foreground text-center leading-relaxed">
                {isIOS()
                  ? `Presiona Compartir y luego "Agregar a pantalla de inicio".`
                  : 'Abre el menú del navegador y selecciona "Instalar app".'}
              </div>
            )}
            {config && (
              <a
                href={"/" + slug}
                className="sa-btn sa-btn-ghost w-full justify-center text-xs py-2"
              >
                Ver más información
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {!hasResult ? (
              <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Verificando plataformas disponibles...
              </div>
            ) : available.length === 0 ? (
              <div className="sa-surface-flat p-4 rounded-2xl text-center">
                <p className="text-sm font-medium text-foreground">Instalador no disponible</p>
                <p className="text-xs text-muted-foreground mt-1">
                  No hay instaladores disponibles para este rol. Usa la versión web desde el navegador.
                </p>
              </div>
            ) : detectedOS !== "other" && available.includes(detectedOS) ? (
              <>
                <button
                  onClick={() => handleDownload(detectedOS)}
                  disabled={downloading !== null}
                  className="sa-btn sa-btn-primary w-full justify-center gap-2.5 text-sm py-2.5 disabled:opacity-60"
                >
                  {downloading === detectedOS ? (
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                  ) : (
                    <PlatformIcon platform={detectedOS} />
                  )}
                  {downloading === detectedOS ? "Descargando..." : `Descargar para ${platformLabels[detectedOS]}`}
                </button>
                <p className="text-[11px] text-muted-foreground text-center">
                  {`educonecta-${config.electronRole}${platformExtensions[detectedOS]}`}
                </p>
                {available.filter((p) => p !== detectedOS).length > 0 && (
                  <div className="flex gap-2 pt-1">
                    {available
                      .filter((p) => p !== detectedOS)
                      .map((p) => (
                        <button
                          key={p}
                          onClick={() => handleDownload(p)}
                          disabled={downloading !== null}
                          className="sa-btn sa-btn-ghost flex-1 justify-center gap-1.5 text-xs py-2 disabled:opacity-60"
                        >
                          <PlatformIcon platform={p} />
                          {platformLabels[p]}
                        </button>
                      ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="text-xs text-muted-foreground text-center">
                  {detectedOS !== "other" && !available.includes(detectedOS)
                    ? `Instalador no disponible para ${platformLabels[detectedOS]}. Selecciona otra plataforma:`
                    : "Selecciona tu sistema operativo:"}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {allPlatforms.map((p) => {
                    const platAvailable = available.includes(p)
                    return (
                      <button
                        key={p}
                        onClick={() => platAvailable && handleDownload(p)}
                        disabled={!platAvailable || downloading !== null}
                        className={`flex-col gap-1.5 py-3 text-xs disabled:opacity-40 ${
                          platAvailable ? "sa-btn sa-btn-outline" : "sa-btn sa-btn-ghost cursor-not-allowed"
                        }`}
                      >
                        <PlatformIcon platform={p} />
                        {platformLabels[p]}
                        {!platAvailable && (
                          <span className="text-[10px] text-muted-foreground">—</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </>
            )}

            {error && (
              <div className="sa-surface-flat p-3 rounded-2xl text-xs text-red-500 dark:text-red-400 text-center leading-relaxed border border-red-500/20">
                {error}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-1 border-t border-[var(--surface-border)]">
          <button
            onClick={() => handleClose(true)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            No volver a mostrar
          </button>
          <button
            onClick={() => handleClose(false)}
            className="text-xs font-medium text-foreground hover:text-foreground/80 transition-colors"
          >
            Ahora no
          </button>
        </div>
      </div>
    </Modal>
  )
}
