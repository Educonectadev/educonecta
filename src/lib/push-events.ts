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

interface SchedulePushArgs {
  courseId: number
  institutionId: number
  dayOfWeek: number
  startTime: string
  endTime: string
  teacherId?: number | null
}

const DAYS_ES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

export async function broadcastScheduleToTeachers(args: SchedulePushArgs) {
  const { courseId, institutionId, dayOfWeek, startTime, endTime, teacherId } = args

  let rows: { userId: number; name: string }[] = []
  try {
    if (teacherId) {
      rows = await query<any[]>(
        `SELECT t.userId, u.name
         FROM Teacher t
         INNER JOIN User u ON u.id = t.userId
         WHERE t.id = ? AND t.institutionId = ? AND u.isActive = TRUE`,
        [teacherId, institutionId],
      )
    }
    if (rows.length === 0) {
      rows = await query<any[]>(
        `SELECT DISTINCT t.userId, u.name
         FROM CourseTeacher ct
         INNER JOIN Teacher t ON t.id = ct.teacherId
         INNER JOIN User u ON u.id = t.userId
         WHERE ct.courseId = ? AND t.institutionId = ? AND u.isActive = TRUE`,
        [courseId, institutionId],
      )
    }
  } catch (err) {
    console.error("[push-events] no se pudieron obtener los profesores del curso:", err)
    return { sent: 0, total: 0 }
  }

  const userIds = Array.from(new Set(rows.map((r) => Number(r.userId)).filter(Boolean)))
  if (userIds.length === 0) return { sent: 0, total: 0 }

  const day = DAYS_ES[dayOfWeek] ?? `Día ${dayOfWeek}`
  return broadcastPushToUsers(userIds, {
    title: "📅 Nuevo horario asignado",
    body: `${day} · ${startTime} - ${endTime}`,
    url: "/dashboard/teacher/horarios",
    tag: `schedule-${Date.now()}`,
  })
}

interface CommunicationPushArgs {
  institutionId: number
  teacherId: number
  title: string
}

export async function broadcastCommunicationToParents(args: CommunicationPushArgs) {
  const { institutionId, teacherId, title } = args

  let rows: { userId: number }[] = []
  try {
    const courseTeachers = await query<any[]>(
      `SELECT DISTINCT ct.gradeId, ct.sectionId
       FROM CourseTeacher ct
       WHERE ct.teacherId = ?`,
      [teacherId],
    )
    const gradeIds = courseTeachers.map((ct) => ct.gradeId).filter(Boolean)
    const sectionIds = courseTeachers.map((ct) => ct.sectionId).filter(Boolean)

    const conditions: string[] = []
    const params: any[] = []
    if (gradeIds.length > 0) {
      conditions.push(`s.gradeId IN (${gradeIds.map(() => "?").join(",")})`)
      params.push(...gradeIds)
    }
    if (sectionIds.length > 0) {
      conditions.push(`s.sectionId IN (${sectionIds.map(() => "?").join(",")})`)
      params.push(...sectionIds)
    }

    const where = conditions.length > 0 ? `AND (${conditions.join(" OR ")})` : ""
    rows = await query<any[]>(
      `SELECT DISTINCT p.userId AS userId
       FROM Student s
       INNER JOIN ParentStudent ps ON ps.studentId = s.id
       INNER JOIN Parent p ON p.id = ps.parentId
       WHERE s.institutionId = ? ${where}`,
      [institutionId, ...params],
    )
  } catch (err) {
    console.error("[push-events] no se pudieron obtener los padres para el comunicado:", err)
    return { sent: 0, total: 0 }
  }

  const userIds = Array.from(new Set(rows.map((r) => Number(r.userId)).filter(Boolean)))
  if (userIds.length === 0) return { sent: 0, total: 0 }

  return broadcastPushToUsers(userIds, {
    title: "📢 Nuevo comunicado",
    body: title,
    url: "/dashboard/parent/comunicados",
    tag: `comm-${Date.now()}`,
  })
}