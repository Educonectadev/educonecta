import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getParentChildren, getChildrenSchedules } from "@/lib/parent-data"
import ParentHorariosClient from "./ParentHorariosClient"

export default async function HorariosPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "PARENT") redirect("/login")

  const parentId = session.user.parentId!
  const institutionId = session.user.institutionId!
  const parent = await getParentChildren(parentId)
  if (!parent) redirect("/login")

  const children = parent.children.map((ps: any) => ps.student)
  const studentIds = children.map((s: any) => s.id)
  const gradeIds = children.map((s: any) => s.gradeId).filter(Boolean) as number[]
  const sectionIds = children.map((s: any) => s.sectionId).filter(Boolean) as number[]

  const schedulesByStudent = await getChildrenSchedules(
    studentIds,
    gradeIds,
    sectionIds,
    institutionId
  )

  const childrenData = children.map((child: any) => ({
    id: child.id,
    firstName: child.firstName,
    lastName: child.lastName,
    grade: child.grade ?? null,
    section: child.section ?? null,
    schedules: (schedulesByStudent[child.id] ?? []).map((s: any) => ({
      id: s.id,
      dayOfWeek: s.dayOfWeek,
      dayName: s.dayName,
      startTime: s.startTime,
      endTime: s.endTime,
      shift: s.shift,
      classroom: s.classroom,
      course: s.course,
      teacherName: s.teacherName,
    })),
  }))

  return <ParentHorariosClient childrenData={childrenData} />
}
