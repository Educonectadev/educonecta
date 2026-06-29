import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getParentChildren, getChildrenAttendance } from "@/lib/parent-data"
import AttendanceList from "./AttendanceList"

export default async function AsistenciaPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "PARENT") redirect("/login")

  const parentId = session.user.parentId!
  const parent = await getParentChildren(parentId)
  if (!parent) redirect("/login")

  const children = parent.children.map((ps) => ps.student)
  const studentIds = children.map((s) => s.id)

  const attendanceByStudent = await getChildrenAttendance(studentIds)

  return (
    <div data-tour="attendance">
      <h1 className="text-2xl font-bold tracking-tight">Asistencia</h1>
      <p className="mt-1 text-sm text-gray-500">
        Registro de asistencia de sus hijos
      </p>

      {children.length === 0 && (
        <div className="mt-12 text-center text-gray-500">
          No hay estudiantes vinculados.
        </div>
      )}

      {children.length > 0 && (
        <AttendanceList children={children} attendanceByStudent={attendanceByStudent} />
      )}
    </div>
  )
}
