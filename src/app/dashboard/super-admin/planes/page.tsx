import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { findMany } from "@/lib/prisma"
import PlanesList from "./PlanesList"

export default async function PlanesAdminPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/login")

  const [subscriptions, institutions] = await Promise.all([
    findMany("Subscription", { orderBy: "updatedAt", orderDir: "DESC" }),
    findMany("Institution", { orderBy: "name" }),
  ])

  const subsById = new Map<number, any>((subscriptions as any[]).map((s) => [s.institutionId, s]))
  const institutionsWithSub = (institutions as any[]).map((i) => ({
    ...i,
    subscription: subsById.get(i.id) ?? null,
  }))

  return (
    <PlanesList
      subscriptions={subscriptions as any}
      institutions={institutionsWithSub as any}
    />
  )
}