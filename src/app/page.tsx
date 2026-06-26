import { getSupabaseAdmin } from "@/lib/supabase"
import HomeContent from "@/components/HomeContent"

async function getInstitutionCount(): Promise<number> {
  try {
    const supabase = getSupabaseAdmin()
    const { count } = await supabase
      .from("Institution")
      .select("id", { count: "exact", head: true })
      .eq("isActive", true)
    return count ?? 0
  } catch {
    return 0
  }
}

export const dynamic = "force-dynamic"

export default async function Home() {
  const institutionCount = await getInstitutionCount()
  const estimatedStudentsPerInstitution = 400
  const totalStudents = institutionCount * estimatedStudentsPerInstitution
  const paperSheetsPerStudentPerMonth = 30
  const treesPerSheet = 1 / 16667
  const co2PerSheet = 0.005

  const paperSaved = totalStudents * paperSheetsPerStudentPerMonth
  const treesSaved = Math.round(paperSaved * treesPerSheet * 12)
  const co2Saved = Math.round(paperSaved * co2PerSheet * 12)

  return (
    <HomeContent
      data={{
        institutionCount,
        paperSaved,
        treesSaved,
        co2Saved,
      }}
    />
  )
}
