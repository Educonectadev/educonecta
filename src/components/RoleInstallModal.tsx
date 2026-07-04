"use client"

import { useState, useEffect } from "react"
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

const DISMISS_PREFIX = "ec-role-modal-dismissed-"

export default function RoleInstallModal() {
  const { data: session, status } = useSession()
  const [open, setOpen] = useState(false)
  const [deferredPrompt, setDeferredState] = useState<any>(null)
  const [installed, setInstalled] = useState(false)

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

  function handleClose(permanent = false) {
    setOpen(false)
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

  function handleDownload() {
    if (!config) return
    const platform = detectPlatform() === "other" ? "win" : detectPlatform()
    window.location.href = `/api/download/public/${config.electronRole}?platform=${platform}`
    handleClose(true)
  }

  if (status !== "authenticated" || !config || installed) return null

  const mobile = isMobile()
  const platform = detectPlatform()
  const platformLabel =
    platform === "win" ? "Windows" : platform === "mac" ? "macOS" : platform === "linux" ? "Linux" : "tu dispositivo"

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
            <p className="text-sm font-semibold text-foreground">Descargar {config.name}</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {mobile
                ? "Instala la aplicación en tu dispositivo para acceder más rápido."
                : `Descarga el instalador nativo para ${platformLabel} y aprovecha al máximo EduConecta.`}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {mobile ? (
            deferredPrompt ? (
              <button onClick={handlePwaInstall} className="sa-btn sa-btn-primary w-full justify-center text-sm py-2.5">
                Instalar aplicación
              </button>
            ) : (
              <div className="sa-surface-flat p-3 rounded-2xl text-xs text-muted-foreground text-center leading-relaxed">
                {/iPhone|iPad|iPod/i.test(navigator.userAgent)
                  ? 'Presiona Compartir y luego "Agregar a pantalla de inicio".'
                  : 'Abre el menú del navegador y selecciona "Instalar app".'}
              </div>
            )
          ) : (
            <button onClick={handleDownload} className="sa-btn sa-btn-primary w-full justify-center text-sm py-2.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Descargar para {platformLabel}
            </button>
          )}

          {config && (
            <a
              href={"/" + slug}
              className="sa-btn sa-btn-ghost w-full justify-center text-xs py-2"
            >
              Ver página de instalación
            </a>
          )}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => handleClose(true)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            No volver a mostrar
          </button>
          <span className="text-xs text-muted-foreground">·</span>
          <button
            onClick={() => handleClose(false)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Ahora no
          </button>
        </div>
      </div>
    </Modal>
  )
}
