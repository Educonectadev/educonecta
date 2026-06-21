import { query } from "@/lib/prisma"

async function getHomeworkList(gradeIds: number[], sectionIds: number[], studentIds: number[]) {
  const studentPlaceholders = studentIds.map(() => "?").join(",")

  let rows: any[]
  if (gradeIds.length > 0 && sectionIds.length > 0) {
    const gradePlaceholders = gradeIds.map(() => "?").join(",")
    const sectionPlaceholders = sectionIds.map(() => "?").join(",")
    rows = await query<any[]>(
      `SELECT h.*,
              c.id AS course__id, c.name AS course__name, c.code AS course__code,
              t.id AS teacher__id, t.speciality AS teacher__speciality,
              u.id AS teacher__user__id, u.name AS teacher__user__name, u.email AS teacher__user__email
       FROM Homework h
       INNER JOIN Course c ON c.id = h.courseId
       INNER JOIN Teacher t ON t.id = h.teacherId
       INNER JOIN User u ON u.id = t.userId
       WHERE (h.gradeId IN (${gradePlaceholders}) AND h.sectionId IN (${sectionPlaceholders}))
          OR h.gradeId IS NULL OR h.sectionId IS NULL
       ORDER BY h.dueDate DESC`,
      [...gradeIds, ...sectionIds]
    )
  } else {
    rows = await query<any[]>(
      `SELECT h.*,
              c.id AS course__id, c.name AS course__name, c.code AS course__code,
              t.id AS teacher__id, t.speciality AS teacher__speciality,
              u.id AS teacher__user__id, u.name AS teacher__user__name, u.email AS teacher__user__email
       FROM Homework h
       INNER JOIN Course c ON c.id = h.courseId
       INNER JOIN Teacher t ON t.id = h.teacherId
       INNER JOIN User u ON u.id = t.userId
       WHERE h.gradeId IS NULL OR h.sectionId IS NULL
       ORDER BY h.dueDate DESC`
    )
  }

  const homeworkIds = rows.map((r) => r.id)
  if (homeworkIds.length === 0) return []

  const submissions = await query<any[]>(
    `SELECT hs.* FROM HomeworkSubmission hs WHERE hs.homeworkId IN (${homeworkIds.map(() => "?").join(",")}) AND hs.studentId IN (${studentPlaceholders})`,
    [...homeworkIds, ...studentIds]
  )

  const submissionsByHomework: Record<number, any[]> = {}
  for (const sub of submissions) {
    if (!submissionsByHomework[sub.homeworkId]) submissionsByHomework[sub.homeworkId] = []
    submissionsByHomework[sub.homeworkId].push(sub)
  }

  return rows.map((r) => {
    const { course__id, course__name, course__code, teacher__id, teacher__speciality, teacher__user__id, teacher__user__name, teacher__user__email, ...rest } = r
    return {
      ...rest,
      course: { id: course__id, name: course__name, code: course__code },
      teacher: { id: teacher__id, speciality: teacher__speciality, user: { id: teacher__user__id, name: teacher__user__name, email: teacher__user__email } },
      submissions: submissionsByHomework[r.id as number] ?? [],
    }
  })
}

function mapScheduleRow(r: any) {
  const { course__id, course__name, course__code, teacher__id, teacher__name, grade__id, grade__name, section__id, section__name, ...rest } = r
  return {
    ...rest,
    course: { id: course__id, name: course__name, code: course__code },
    teacher: teacher__id ? { id: teacher__id, name: teacher__name } : null,
    grade: grade__id ? { id: grade__id, name: grade__name } : null,
    section: section__id ? { id: section__id, name: section__name } : null,
  }
}

async function getScheduleList(courseIds: number[], institutionId: number) {
  if (courseIds.length === 0) {
    const rows = await query<any[]>(
      `SELECT s.*,
              c.id AS course__id, c.name AS course__name, c.code AS course__code,
              t.id AS teacher__id, u.name AS teacher__name,
              g.id AS grade__id, g.name AS grade__name,
              sec.id AS section__id, sec.name AS section__name
       FROM Schedule s
       INNER JOIN Course c ON c.id = s.courseId
       LEFT JOIN Teacher t ON s.teacherId = t.id
       LEFT JOIN User u ON t.userId = u.id
       LEFT JOIN Grade g ON s.gradeId = g.id
       LEFT JOIN Section sec ON s.sectionId = sec.id
       WHERE s.institutionId = ?
       ORDER BY s.dayOfWeek ASC, s.startTime ASC`,
      [institutionId]
    )
    return rows.map(mapScheduleRow)
  }

  const placeholders = courseIds.map(() => "?").join(",")
  const rows = await query<any[]>(
    `SELECT s.*,
            c.id AS course__id, c.name AS course__name, c.code AS course__code,
            t.id AS teacher__id, u.name AS teacher__name,
            g.id AS grade__id, g.name AS grade__name,
            sec.id AS section__id, sec.name AS section__name
     FROM Schedule s
     INNER JOIN Course c ON c.id = s.courseId
     LEFT JOIN Teacher t ON s.teacherId = t.id
     LEFT JOIN User u ON t.userId = u.id
     LEFT JOIN Grade g ON s.gradeId = g.id
     LEFT JOIN Section sec ON s.sectionId = sec.id
     WHERE s.courseId IN (${placeholders}) AND s.institutionId = ?
     ORDER BY s.dayOfWeek ASC, s.startTime ASC`,
    [...courseIds, institutionId]
  )
  return rows.map(mapScheduleRow)
}

export async function getParentChildren(parentId: number) {
  const parentRows = await query<any[]>(
    `SELECT id FROM Parent WHERE id = ? LIMIT 1`,
    [parentId]
  )
  if (parentRows.length === 0) return null

  const rows = await query<any[]>(
    `SELECT ps.relationship,
            s.id AS student__id, s.firstName, s.lastName, s.documentId, s.email, s.phone,
            s.institutionId, s.isActive, s.gradeId, s.sectionId,
            g.id AS grade__id, g.name AS grade__name, g.level AS grade__level,
            sec.id AS section__id, sec.name AS section__name, sec.capacity AS section__capacity
     FROM ParentStudent ps
     INNER JOIN Student s ON s.id = ps.studentId
     LEFT JOIN Grade g ON g.id = s.gradeId
     LEFT JOIN Section sec ON sec.id = s.sectionId
     WHERE ps.parentId = ?`,
    [parentId]
  )

  const children: any[] = []
  for (const r of rows) {
    const { grade__id, grade__name, grade__level, section__id, section__name, section__capacity, relationship, student__id, gradeId, sectionId, ...studentFields } = r

    const enrollments = await query<any[]>(
      `SELECT id, academicYear, isActive FROM Enrollment
       WHERE studentId = ? AND isActive = 1
       ORDER BY academicYear DESC
       LIMIT 1`,
      [student__id]
    )

    children.push({
      student: {
        id: student__id,
        ...studentFields,
        grade: grade__id ? { id: grade__id, name: grade__name, level: grade__level } : null,
        section: section__id ? { id: section__id, name: section__name, capacity: section__capacity } : null,
        enrollments,
      },
      relationship,
    })
  }

  return { children }
}

export async function getChildrenHomeworks(
  studentIds: number[],
  gradeIds: number[],
  sectionIds: number[]
): Promise<Record<number, any[]>> {
  const homeworks = await getHomeworkList(gradeIds, sectionIds, studentIds)

  const grouped: Record<number, any[]> = {}
  for (const hw of homeworks) {
    const subs = (hw.submissions as any[]) ?? []
    if (subs.length > 0) {
      for (const sub of subs) {
        if (!grouped[sub.studentId]) grouped[sub.studentId] = []
        if (!grouped[sub.studentId].find((h) => h.id === hw.id)) grouped[sub.studentId].push(hw)
      }
    }
  }

  for (const sid of studentIds) {
    if (!grouped[sid]) grouped[sid] = []
    const existingIds = new Set(grouped[sid].map((h) => h.id))
    for (const hw of homeworks) {
      if (!existingIds.has(hw.id)) {
        grouped[sid].push(hw)
        existingIds.add(hw.id)
      }
    }
  }

  return grouped
}

export async function getChildrenGrades(studentIds: number[]) {
  if (studentIds.length === 0) return {}

  const placeholders = studentIds.map(() => "?").join(",")
  const rows = await query<any[]>(
    `SELECT gr.*,
            c.id AS course__id, c.name AS course__name, c.code AS course__code,
            t.id AS teacher__id, t.speciality AS teacher__speciality,
            u.id AS teacher__user__id, u.name AS teacher__user__name, u.email AS teacher__user__email
     FROM GradeRecord gr
     INNER JOIN Course c ON c.id = gr.courseId
     INNER JOIN Teacher t ON t.id = gr.teacherId
     INNER JOIN User u ON u.id = t.userId
     WHERE gr.studentId IN (${placeholders})
     ORDER BY gr.studentId ASC, gr.evaluationDate DESC`,
    studentIds
  )

  const records = rows.map((r) => {
    const { course__id, course__name, course__code, teacher__id, teacher__speciality, teacher__user__id, teacher__user__name, teacher__user__email, ...rest } = r
    return {
      ...rest,
      course: { id: course__id, name: course__name, code: course__code },
      teacher: { id: teacher__id, speciality: teacher__speciality, user: { id: teacher__user__id, name: teacher__user__name, email: teacher__user__email } },
    }
  })

  const grouped: Record<number, typeof records> = {}
  for (const r of records) {
    if (!grouped[r.studentId as number]) grouped[r.studentId as number] = []
    grouped[r.studentId as number].push(r)
  }
  return grouped
}

export async function getChildrenAttendance(studentIds: number[]) {
  if (studentIds.length === 0) return {}

  const placeholders = studentIds.map(() => "?").join(",")
  const rows = await query<any[]>(
    `SELECT a.*,
            t.id AS teacher__id, t.speciality AS teacher__speciality,
            u.id AS teacher__user__id, u.name AS teacher__user__name, u.email AS teacher__user__email
     FROM Attendance a
     INNER JOIN Teacher t ON t.id = a.teacherId
     INNER JOIN User u ON u.id = t.userId
     WHERE a.studentId IN (${placeholders})
     ORDER BY a.studentId ASC, a.date DESC
     LIMIT 200`,
    studentIds
  )

  const records = rows.map((r) => {
    const { teacher__id, teacher__speciality, teacher__user__id, teacher__user__name, teacher__user__email, ...rest } = r
    return {
      ...rest,
      teacher: { id: teacher__id, speciality: teacher__speciality, user: { id: teacher__user__id, name: teacher__user__name, email: teacher__user__email } },
    }
  })

  const grouped: Record<number, typeof records> = {}
  for (const r of records) {
    if (!grouped[r.studentId as number]) grouped[r.studentId as number] = []
    grouped[r.studentId as number].push(r)
  }
  return grouped
}

export async function getChildrenSchedules(
  studentIds: number[],
  gradeIds: number[],
  sectionIds: number[],
  institutionId: number
): Promise<Record<number, any[]>> {
  const result: Record<number, any[]> = {}
  for (const sid of studentIds) result[sid] = []

  // Try CourseTeacher fallback for teacher names (only if we have grade/section filters)
  let ctRows: any[] = []
  if (gradeIds.length > 0 && sectionIds.length > 0) {
    const gradePlaceholders = gradeIds.map(() => "?").join(",")
    const sectionPlaceholders = sectionIds.map(() => "?").join(",")
    ctRows = await query<any[]>(
      `SELECT ct.*,
              c.id AS course__id, c.name AS course__name, c.code AS course__code,
              t.id AS teacher__id,
              u.id AS teacher__user__id, u.name AS teacher__user__name
       FROM CourseTeacher ct
       INNER JOIN Course c ON c.id = ct.courseId
       INNER JOIN Teacher t ON t.id = ct.teacherId
       INNER JOIN User u ON u.id = t.userId
       WHERE ct.gradeId IN (${gradePlaceholders}) AND ct.sectionId IN (${sectionPlaceholders})`,
      [...gradeIds, ...sectionIds]
    )
  }

  // Fetch ALL schedules for the institution
  const schedules = await getScheduleList([], institutionId)

  const dayMap: Record<number, string> = {
    1: "Lunes", 2: "Martes", 3: "Miércoles",
    4: "Jueves", 5: "Viernes", 6: "Sábado", 7: "Domingo",
  }

  const studentGradeSection = await query<any[]>(
    `SELECT id, gradeId, sectionId FROM Student WHERE id IN (${studentIds.map(() => "?").join(",")})`,
    studentIds
  )
  const gsByStudent: Record<number, { gradeId: number | null; sectionId: number | null }> = {}
  for (const r of studentGradeSection) gsByStudent[r.id as number] = r

  for (const sid of studentIds) {
    const gs = gsByStudent[sid]
    const studentGradeId = gs?.gradeId
    const studentSectionId = gs?.sectionId

    const matched: any[] = []
    for (const s of schedules) {
      let show = false
      if (s.gradeId != null || s.sectionId != null) {
        const gMatch = !s.gradeId || s.gradeId === studentGradeId
        const secMatch = !s.sectionId || s.sectionId === studentSectionId
        show = gMatch && secMatch
      } else {
        show = true
      }

      if (show) {
        const ct = ctRows.find((c) => c.courseId === s.courseId)
        const teacherName = s.teacher?.name || ct?.teacher__user__name || "—"
        matched.push({
          ...s,
          dayName: dayMap[s.dayOfWeek as number] ?? `Día ${s.dayOfWeek}`,
          teacherName,
        })
      }
    }

    const seen = new Set<number>()
    result[sid] = matched.filter((m) => { if (seen.has(m.id)) return false; seen.add(m.id); return true })
  }
  return result
}

export async function getChildrenDiscipline(studentIds: number[]) {
  if (studentIds.length === 0) return {}

  const placeholders = studentIds.map(() => "?").join(",")
  const rows = await query<any[]>(
    `SELECT d.*,
            t.id AS teacher__id, t.speciality AS teacher__speciality,
            u.id AS teacher__user__id, u.name AS teacher__user__name, u.email AS teacher__user__email
     FROM Discipline d
     INNER JOIN Teacher t ON t.id = d.teacherId
     INNER JOIN User u ON u.id = t.userId
     WHERE d.studentId IN (${placeholders})
     ORDER BY d.studentId ASC, d.date DESC`,
    studentIds
  )

  const records = rows.map((r) => {
    const { teacher__id, teacher__speciality, teacher__user__id, teacher__user__name, teacher__user__email, ...rest } = r
    return {
      ...rest,
      teacher: { id: teacher__id, speciality: teacher__speciality, user: { id: teacher__user__id, name: teacher__user__name, email: teacher__user__email } },
    }
  })

  const grouped: Record<number, typeof records> = {}
  for (const r of records) {
    if (!grouped[r.studentId as number]) grouped[r.studentId as number] = []
    grouped[r.studentId as number].push(r)
  }
  return grouped
}

export async function getInstitutionCommunications(institutionId: number) {
  const rows = await query<any[]>(
    `SELECT comm.*,
            u.id AS author__id, u.email AS author__email, u.name AS author__name, u.role AS author__role,
            t.id AS teacher__id, t.speciality AS teacher__speciality,
            tu.id AS teacher__user__id, tu.name AS teacher__user__name, tu.email AS teacher__user__email
     FROM Communication comm
     INNER JOIN User u ON u.id = comm.authorId
     LEFT JOIN Teacher t ON t.id = comm.teacherId
     LEFT JOIN User tu ON tu.id = t.userId
     WHERE comm.institutionId = ?
     ORDER BY comm.createdAt DESC`,
    [institutionId]
  )

  return rows.map((r) => {
    const { author__id, author__email, author__name, author__role, teacher__id, teacher__speciality, teacher__user__id, teacher__user__name, teacher__user__email, ...rest } = r
    return {
      ...rest,
      author: { id: author__id, email: author__email, name: author__name, role: author__role },
      teacher: teacher__id ? { id: teacher__id, speciality: teacher__speciality, user: { id: teacher__user__id, name: teacher__user__name, email: teacher__user__email } } : null,
    }
  })
}

export async function getParentNotifications(userId: number, parentId: number) {
  const rows = await query<any[]>(
    `SELECT n.*, s.id AS student__id, s.firstName AS student__firstName, s.lastName AS student__lastName
     FROM Notification n
     LEFT JOIN Student s ON s.id = n.studentId
     WHERE n.userId = ? OR n.parentId = ?
     ORDER BY n.createdAt DESC`,
    [userId, parentId]
  )

  return rows.map((r) => {
    const { student__id, student__firstName, student__lastName, ...rest } = r
    return {
      ...rest,
      student: student__id ? { id: student__id, firstName: student__firstName, lastName: student__lastName } : null,
    }
  })
}
