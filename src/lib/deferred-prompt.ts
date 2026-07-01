"use client"

let deferredPrompt: any = null
let listeners: Array<(p: any) => void> = []

export function setDeferredPrompt(p: any) {
  deferredPrompt = p
  listeners.forEach((fn) => fn(p))
}

export function getDeferredPrompt() {
  return deferredPrompt
}

export function onDeferredPrompt(fn: (p: any) => void) {
  listeners.push(fn)
  return () => {
    listeners = listeners.filter((l) => l !== fn)
  }
}

export function clearDeferredPrompt() {
  deferredPrompt = null
}
