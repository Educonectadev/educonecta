import { query } from "./prisma"
import { broadcastPushToUsers } from "./push-broadcast"

interface HomeworkPushArgs {
  teacherId: number
  courseId: number
  gradeId: number | null
  sectionId: number | null
  title: string
  dueDate: string
}

export async function broadcastHomeworkToParents(args: HomeworkPushArgs) {
  const { teacherId, courseId, gradeId, sectionId, title, dueDate } = args

  let rows: { parentUserId: number }[] = []
  try {
    if (sectionId) {
      rows = await query<any[]>(
        `SELECT DISTINCT ps.parentId, p.userId AS parentUserId
         FROM Student s
         INNER JOIN ParentStudent ps ON ps.studentId = s.id
         INNER JOIN Parent p ON p.id = ps.parentId
         WHERE s.sectionId = ?`,
        [sectionId],
      )
    } else if (gradeId) {
      rows = await query<any[]>(
        `SELECT DISTINCT ps.parentId, p.userId AS parentUserId
         FROM Student s
         INNER JOIN ParentStudent ps ON ps.studentId = s.id
         INNER JOIN Parent p ON p.id = ps.parentId
         WHERE s.gradeId = ?`,
        [gradeId],
      )
    } else {
      const courseTeachers = await query<any[]>(
        `SELECT gradeId, sectionId FROM CourseTeacher WHERE courseId = ? AND teacherId = ?`,
        [courseId, teacherId],
      )
      const gradeIds = courseTeachers.map((ct) => ct.gradeId).filter(Boolean)
      if (gradeIds.length === 0) return { sent: 0, total: 0 }
      rows = await query<any[]>(
        `SELECT DISTINCT ps.parentId, p.userId AS parentUserId
         FROM Student s
         INNER JOIN ParentStudent ps ON ps.studentId = s.id
         INNER JOIN Parent p ON p.id = ps.parentId
         WHERE s.gradeId IN (${gradeIds.map(() => "?").join(",")})`,
        gradeIds,
      )
    }
  } catch (err) {
    console.error("[push-events] no se pudieron obtener los padres:", err)
    return { sent: 0, total: 0 }
  }

  const userIds = Array.from(new Set(rows.map((r) => Number(r.parentUserId)).filter(Boolean)))
  if (userIds.length === 0) return { sent: 0, total: 0 }

  const due = new Date(dueDate)
  const formatted = due.toLocaleDateString("es-PE", { day: "2-digit", month: "short" })

  return broadcastPushToUsers(userIds, {
    title: "📚 Nueva tarea",
    body: `${title} · vence ${formatted}`,
    url: "/dashboard/parent",
    tag: `homework-${Date.now()}`,
  })
}