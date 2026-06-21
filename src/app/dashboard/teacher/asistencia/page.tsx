import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { query } from "@/lib/prisma"
import Link from "next/link"

export default async function AsistenciaPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "TEACHER") redirect("/login")

  const teacherId = session.user.teacherId!

  const ctData = await query<any[]>(
    "SELECT ct.*, c.id as c_id, c.name as c_name, g.id as g_id, g.name as g_name, sec.id as sec_id, sec.name as sec_name FROM CourseTeacher ct LEFT JOIN Course c ON c.id = ct.courseId LEFT JOIN Grade g ON g.id = ct.gradeId LEFT JOIN Section sec ON sec.id = ct.sectionId WHERE ct.teacherId = ?",
    [teacherId]
  )

  const courseTeachers = ctData.map((ct) => ({
    id: ct.id,
    courseId: ct.courseId,
    gradeId: ct.gradeId,
    sectionId: ct.sectionId,
    course: { id: ct.c_id, name: ct.c_name },
    grade: ct.g_id ? { id: ct.g_id, name: ct.g_name } : null,
    section: ct.sec_id ? { id: ct.sec_id, name: ct.sec_name } : null,
  }))

  const attendanceData = await query<any[]>(
    "SELECT a.*, s.firstName as s_firstName, s.lastName as s_lastName FROM Attendance a LEFT JOIN Student s ON s.id = a.studentId WHERE a.teacherId = ? ORDER BY a.date DESC LIMIT 20",
    [teacherId]
  )

  const recentAttendance = attendanceData.map((a) => ({
    id: a.id,
    date: a.date,
    isPresent: !!a.isPresent,
    note: a.note,
    student: { firstName: a.s_firstName, lastName: a.s_lastName },
  }))

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-8">Asistencia</h1>

      <h2 className="text-lg font-semibold tracking-tight mb-4">Tomar Asistencia</h2>
      <div className="grid gap-3 mb-10">
        {courseTeachers.map((ct: { id: number; courseId: number; gradeId: number | null; sectionId: number | null; course: { name: string }; grade: { name: string } | null; section: { name: string } | null }) => (
          <Link
            key={ct.id}
            href={`/dashboard/teacher/asistencia/tomar?courseId=${ct.courseId}&gradeId=${ct.gradeId}&sectionId=${ct.sectionId}`}
            className="bg-gray-50 border border-gray-200 rounded-[25px] p-5 block hover:bg-gray-100 transition-all"
          >
            <p className="font-medium">{ct.course.name}</p>
            <p className="text-sm text-gray-500">
              {ct.grade?.name ?? "—"} / {ct.section?.name ?? "—"}
            </p>
          </Link>
        ))}
      </div>

      <h2 className="text-lg font-semibold tracking-tight mb-4">Registros Recientes</h2>
      {recentAttendance.length === 0 ? (
        <p className="text-sm text-gray-500">Sin registros.</p>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-[30px]">
          <table className="w-full text-sm border-collapse">
            <thead className="hidden md:table-header-group">
              <tr className="border-b border-gray-200 text-left">
                <th className="py-3 px-5 font-medium text-gray-500 text-xs uppercase tracking-widest">Estudiante</th>
                <th className="py-3 px-5 font-medium text-gray-500 text-xs uppercase tracking-widest">Fecha</th>
                <th className="py-3 px-5 font-medium text-gray-500 text-xs uppercase tracking-widest">Presente</th>
                <th className="py-3 px-5 font-medium text-gray-500 text-xs uppercase tracking-widest">Nota</th>
              </tr>
            </thead>
            <tbody>
              {recentAttendance.map((a: { id: number; date: Date; isPresent: boolean; note: string | null; student: { firstName: string; lastName: string } }) => (
                <tr key={a.id} className="flex flex-col md:table-row border border-gray-100 md:border-0 rounded-[30px] p-4 md:p-0 mb-3 md:mb-0">
                  <td className="flex justify-between md:table-cell px-0 md:px-5 py-1 md:py-3">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Estudiante</span>
                    <span>{a.student.firstName} {a.student.lastName}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-5 py-1 md:py-3 text-gray-600">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Fecha</span>
                    <span>{a.date.toLocaleDateString("es-ES")}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-5 py-1 md:py-3">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Presente</span>
                    <span>{a.isPresent ? "Sí" : "No"}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-5 py-1 md:py-3 text-gray-500">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Nota</span>
                    <span>{a.note ?? "—"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
