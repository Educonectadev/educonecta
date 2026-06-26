/* Service Worker de EduConecta
 * - Maneja eventos 'push' entrantes (notificaciones del servidor)
 * - Muestra notificaciones del sistema operativo incluso con la app
 *   cerrada o la pantalla bloqueada, igual que WhatsApp
 * - Al hacer click, enfoca o abre la app en la URL indicada
 */

self.addEventListener("install", (event) => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim())
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
    } catch (e) {
      try { payload.body = event.data.text() } catch {}
    }
  }

  const options = {
    body: payload.body,
    icon: payload.icon,
    badge: payload.badge,
    tag: payload.tag,
    renotify: !!payload.tag,
    requireInteraction: false,
    silent: false,
    vibrate: [200, 100, 200],
    data: { url: payload.url, ...(payload.data || {}) },
    actions: [
      { action: "open", title: "Abrir" },
      { action: "dismiss", title: "Cerrar" },
    ],
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, options).catch((err) => {
      console.error("[sw] showNotification error", err)
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
        const newSub = await self.registration.pushManager.subscribe(event.oldSubscription.options)
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

self.addEventListener("message", (event) => {
  // mensajes de la página (debug)
})