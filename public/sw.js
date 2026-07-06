/* Service Worker de EduConecta
 * - Cachea assets estáticos para funcionamiento offline parcial
 * - Muestra notificaciones push incluso con la app cerrada
 * - Re-suscribe automáticamente cuando expira la suscripción
 */

const CACHE = "educonecta-v2"
const STATIC_ASSETS = [
  "/",
  "/login",
  "/rol/dev",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon.svg",
  "/icons/apple-touch-icon.png",
  "/icons/favicon-16x16.png",
  "/icons/favicon-32x32.png",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE)
        await cache.addAll(STATIC_ASSETS)
      } catch {}
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await self.clients.claim()
      const keys = await caches.keys()
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    })(),
  )
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (url.pathname.startsWith("/api/")) {
    return
  }

  if (
    request.method !== "GET" ||
    url.pathname.startsWith("/installers") ||
    url.pathname.match(/\.(exe|deb|dmg|apk)$/i)
  ) {
    return
  }

  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request)
        if (response.ok && response.type === "basic") {
          const cache = await caches.open(CACHE)
          cache.put(request, response.clone())
        }
        return response
      } catch {
        const cached = await caches.match(request)
        if (cached) return cached
        const fallback = await caches.match("/")
        if (fallback) return fallback
        return new Response("Sin conexión", { status: 503 })
      }
    })(),
  )
})

self.addEventListener("push", (event) => {
  let payload = {
    title: "EduConecta",
    body: "Tienes una nueva notificación",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    url: "/",
    tag: undefined,
    data: {},
  }

  if (event.data) {
    try {
      const incoming = event.data.json()
      payload = {
        title: incoming.title ?? payload.title,
        body: incoming.body ?? payload.body,
        icon: incoming.icon ?? payload.icon,
        badge: incoming.badge ?? payload.badge,
        url: incoming.url ?? payload.url,
        tag: incoming.tag,
        data: incoming.data ?? {},
      }
    } catch {
      try { payload.body = event.data.text() } catch {}
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon,
      badge: payload.badge,
      tag: payload.tag,
      renotify: !!payload.tag,
      requireInteraction: false,
      vibrate: [200, 100, 200],
      data: { url: payload.url, ...payload.data },
      actions: [
        { action: "open", title: "Abrir" },
        { action: "dismiss", title: "Cerrar" },
      ],
    }),
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const targetUrl = (event.notification.data && event.notification.data.url) || "/"
  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true })
      for (const client of allClients) {
        const url = new URL(client.url)
        if (url.pathname.startsWith("/dashboard") || url.pathname === "/") {
          try {
            await client.focus()
            client.postMessage({ type: "push-click", url: targetUrl })
            return
          } catch {}
        }
      }
      await self.clients.openWindow(targetUrl)
    })(),
  )
})

self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    (async () => {
      try {
        let options = {}
        if (event.oldSubscription) {
          options = event.oldSubscription.options
        }
        const newSub = await self.registration.pushManager.subscribe(options)
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscription: newSub.toJSON() }),
        })
      } catch (err) {
        console.error("[sw] resubscribe error", err)
      }
    })(),
  )
})

self.addEventListener("message", (event) => {})
