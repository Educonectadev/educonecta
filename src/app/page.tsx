import { getSupabaseAdmin } from "@/lib/supabase"
import HomeContent from "@/components/HomeContent"

interface Partner {
  id: number
  name: string
  logoUrl: string
}

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

async function getPartners(): Promise<Partner[]> {
  try {
    const supabase = getSupabaseAdmin()
    const { data } = await supabase
      .from("PartnerInstitution")
      .select("id, name, logourl")
      .eq("isactive", true)
      .order("order", { ascending: true })
    return (data ?? []).map((item: Record<string, unknown>) => ({
      id: item.id as number,
      name: item.name as string,
      logoUrl: item.logourl as string,
    }))
  } catch {
    return []
  }
}

export const dynamic = "force-dynamic"

export default async function Home() {
  const [institutionCount, partners] = await Promise.all([getInstitutionCount(), getPartners()])
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
      partners={partners}
    />
  )
}
