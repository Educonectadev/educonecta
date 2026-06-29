import type { TourRole, TourStep } from "./types"

const stepModules: (() => TourStep[])[] = []

export function registerTourSteps(steps: TourStep[]) {
  stepModules.push(() => steps)
}

export function getAllSteps(): TourStep[] {
  return stepModules.flatMap((fn) => fn())
}

export function getStepsForRole(role: TourRole): TourStep[] {
  return getAllSteps().filter((s) => s.role.includes(role))
}

export function getStepsForRoute(route: string, role: TourRole): TourStep[] {
  return getStepsForRole(role)
    .filter((s) => route.startsWith(s.route))
    .sort((a, b) => a.order - b.order)
}
