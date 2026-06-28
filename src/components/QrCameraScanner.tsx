"use client"

import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"

interface Props {
  /** Token detectado (última lectura). Se dispara cada vez que el scanner lee un QR. */
  onScan: (token: string) => void
  /** ID único del elemento DOM donde se monta el video. */
  elementId: string
  /** Pausar el scanner (ej. mientras se navega). */
  paused?: boolean
}

export default function QrCameraScanner({ onScan, elementId, paused }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [permission, setPermission] = useState<"unknown" | "granted" | "denied">("unknown")
  const lastTokenRef = useRef<string>("")
  const lastAtRef = useRef<number>(0)

  async function start() {
    setError(null)
    if (typeof window === "undefined") return
    try {
      const scanner = new Html5Qrcode(elementId, { verbose: false })
      scannerRef.current = scanner
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 260, height: 260 } },
        (decodedText) => {
          // Evitar disparar el mismo QR más de una vez en 2 segundos.
          const now = Date.now()
          if (decodedText === lastTokenRef.current && now - lastAtRef.current < 2000) return
          lastTokenRef.current = decodedText
          lastAtRef.current = now
          onScan(decodedText)
        },
        () => {
          // Errores de frame se ignoran silenciosamente.
        }
      )
      setRunning(true)
      setPermission("granted")
    } catch (e: any) {
      const msg = String(e?.message ?? e ?? "")
      if (/Permission|NotAllowedError|denied/i.test(msg)) {
        setPermission("denied")
        setError("Permiso de cámara denegado. Habilítalo en los ajustes del navegador.")
      } else if (/NotFound|requested device/i.test(msg)) {
        setError("No se encontró una cámara en este dispositivo.")
      } else {
        setError(msg || "No se pudo iniciar la cámara.")
      }
      setRunning(false)
    }
  }

  async function stop() {
    try {
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      }
    } catch {}
    scannerRef.current = null
    setRunning(false)
  }

  useEffect(() => {
    if (paused && running) stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused])

  useEffect(() => {
    return () => {
      stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-3">
      <div className="relative w-full overflow-hidden rounded-2xl bg-black border border-gray-100 dark:border-zinc-800">
        <div id={elementId} className="w-full" style={{ minHeight: 260 }} />
        {!running && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 text-white/80 bg-gradient-to-b from-zinc-900 to-black">
            <svg className="size-10 mb-2 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <p className="text-sm">Cámara apagada</p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        {!running ? (
          <button
            type="button"
            onClick={start}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-[30px] bg-emerald-600 hover:bg-emerald-700 transition-colors duration-200 px-5 py-2.5 text-sm font-medium text-white"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            {permission === "denied" ? "Reintentar cámara" : "Iniciar cámara"}
          </button>
        ) : (
          <button
            type="button"
            onClick={stop}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-[30px] bg-red-600 hover:bg-red-700 transition-colors duration-200 px-5 py-2.5 text-sm font-medium text-white"
          >
            Detener cámara
          </button>
        )}
      </div>
    </div>
  )
}