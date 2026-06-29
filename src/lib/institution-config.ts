import { getSupabaseAdmin } from "./supabase"
import { findOne, update } from "./supabase-db"

export type GradeScale = {
  type: "numeric" | "literal" | "mixed"
  min: number
  max: number
  passing: number
  literalGrades?: { label: string; min: number; max: number }[]
}

export type EvaluationSystem = {
  periods: "bimester" | "trimester" | "semester" | "quarter"
  periodsPerYear: number
  gradeScale: GradeScale
  weightType: "average" | "weighted"
}

export type InstitutionSettings = {
  evaluationSystem: EvaluationSystem
  academicYears: string[]
  shifts: { id: string; name: string; start: string; end: string }[]
}

export const DEFAULT_SETTINGS: InstitutionSettings = {
  evaluationSystem: {
    periods: "bimester",
    periodsPerYear: 4,
    gradeScale: {
      type: "numeric",
      min: 0,
      max: 20,
      passing: 11,
    },
    weightType: "average",
  },
  academicYears: [],
  shifts: [
    { id: "morning", name: "Mañana", start: "07:30", end: "13:00" },
    { id: "afternoon", name: "Tarde", start: "13:30", end: "18:00" },
  ],
}

export async function getSettings(institutionId: number): Promise<InstitutionSettings> {
  const inst = await findOne<any>("Institution", { id: institutionId }, ["settings"])
  if (!inst?.settings) return { ...DEFAULT_SETTINGS }

  const settings = typeof inst.settings === "string"
    ? JSON.parse(inst.settings)
    : inst.settings

  return { ...DEFAULT_SETTINGS, ...settings }
}

export async function updateSettings(
  institutionId: number,
  settings: Partial<InstitutionSettings>,
): Promise<void> {
  const current = await getSettings(institutionId)
  const merged = { ...current, ...settings }

  await getSupabaseAdmin()
    .from("Institution")
    .update({ settings: JSON.stringify(merged) })
    .eq("id", institutionId)
}
