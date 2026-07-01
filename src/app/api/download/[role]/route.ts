import { redirect } from "next/navigation"

const alias: Record<string, string> = {
  director: "admin",
  docente: "teacher",
  padre: "parent",
  alumno: "student",
}

export async function GET(_request: Request, { params }: { params: Promise<{ role: string }> }) {
  const { role: rawRole } = await params
  const role = alias[rawRole] ?? rawRole
  redirect(`/login?role=${role}`)
}
