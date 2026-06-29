type LogLevel = "info" | "warn" | "error" | "debug"

type LogEntry = {
  level: LogLevel
  message: string
  context?: Record<string, unknown>
  timestamp: string
  duration?: number
}

const isDev = process.env.NODE_ENV === "development"

export function log(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
  duration?: number,
) {
  const entry: LogEntry = {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
    duration,
  }

  if (isDev) {
    const prefix = `[${level.toUpperCase()}]`
    const dur = duration ? ` (${duration}ms)` : ""
    console.log(`${prefix} ${message}${dur}`, context ?? "")
  }

  if (!isDev && typeof globalThis !== "undefined") {
    try {
      fetch("/api/monitor/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      }).catch(() => {})
    } catch {}
  }

  return entry
}

export function logAsync<T>(
  promise: Promise<T>,
  label: string,
): Promise<T> {
  const start = Date.now()
  return promise
    .then((result) => {
      log("info", label, undefined, Date.now() - start)
      return result
    })
    .catch((err) => {
      log("error", label, { error: String(err) }, Date.now() - start)
      throw err
    })
}

export const monitor = {
  info: (msg: string, ctx?: Record<string, unknown>) => log("info", msg, ctx),
  warn: (msg: string, ctx?: Record<string, unknown>) => log("warn", msg, ctx),
  error: (msg: string, ctx?: Record<string, unknown>) => log("error", msg, ctx),
  debug: (msg: string, ctx?: Record<string, unknown>) => log("debug", msg, ctx),
  async: logAsync,
}
