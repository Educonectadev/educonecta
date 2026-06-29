const STORAGE_KEY = "educonecta_tour_completed"

export function isTourCompleted(): boolean {
  if (typeof window === "undefined") return true
  try {
    return localStorage.getItem(STORAGE_KEY) === "true"
  } catch {
    return true
  }
}

export function markTourCompleted() {
  try {
    localStorage.setItem(STORAGE_KEY, "true")
  } catch {}
}

export function resetTour() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
}
