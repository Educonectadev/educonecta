"use client"

import { Table } from "@heroui/react"

interface Grade {
  id: number
  course: { name: string }
  evaluationName: string
  grade: number
  evaluationDate: string | null
}

interface ChildInfo {
  id: number
  firstName: string
  lastName: string
}

export default function GradesTable({
  grades,
  child,
  byCourse,
}: {
  grades: Grade[]
  child: ChildInfo
  byCourse: Record<string, Grade[]>
}) {
  const courseAverages: Record<string, string> = {}
  for (const [course, gs] of Object.entries(byCourse)) {
    const avg = gs.reduce((sum, g) => sum + g.grade, 0) / gs.length
    courseAverages[course] = avg.toFixed(1)
  }

  const rows = Object.entries(byCourse).flatMap(([courseName, gs]) =>
    gs.map((g) => ({
      ...g,
      courseName,
      average: courseAverages[courseName],
    }))
  )

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label="Tabla de calificaciones" className="min-w-[600px]">
          <Table.Header>
            <Table.Column isRowHeader>Curso</Table.Column>
            <Table.Column>Evaluación</Table.Column>
            <Table.Column>Nota</Table.Column>
            <Table.Column>Fecha</Table.Column>
            <Table.Column>Promedio</Table.Column>
          </Table.Header>
          <Table.Body>
            {rows.map((row) => (
              <Table.Row key={row.id}>
                <Table.Cell>{row.courseName}</Table.Cell>
                <Table.Cell>{row.evaluationName}</Table.Cell>
                <Table.Cell>{row.grade}</Table.Cell>
                <Table.Cell>
                  {row.evaluationDate
                    ? new Date(row.evaluationDate).toLocaleDateString("es-ES")
                    : "—"}
                </Table.Cell>
                <Table.Cell>{row.average}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  )
}
