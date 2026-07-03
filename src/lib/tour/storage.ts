const COMPLETED_KEY = "ec_tour_completed"
const FORCE_KEY = "ec_tour_force"

export function isTourCompleted(): boolean {
  if (typeof window === "undefined") return true
  try {
    return localStorage.getItem(COMPLETED_KEY) === "true"
  } catch {
    return true
  }
}

export function markTourCompleted() {
  try {
    localStorage.setItem(COMPLETED_KEY, "true")
  } catch {}
}

export function getForceRestart(): boolean {
  if (typeof window === "undefined") return false
  try {
    return localStorage.getItem(FORCE_KEY) === "true"
  } catch {
    return false
  }
}

export function setForceRestart() {
  try {
    localStorage.setItem(FORCE_KEY, "true")
  } catch {}
}

export function clearForceRestart() {
  try {
    localStorage.removeItem(FORCE_KEY)
  } catch {}
}
