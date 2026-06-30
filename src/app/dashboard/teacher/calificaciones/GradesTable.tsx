"use client"

import { Table } from "@heroui/react"

interface Grade {
  id: number
  evaluationName: string
  grade: number
  evaluationDate: Date | null
  student: { firstName: string; lastName: string }
  course: { id: number; name: string }
}

export default function GradesTable({ grades }: { grades: Grade[] }) {
  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content className="min-w-[600px]">
          <Table.Header>
            <Table.Column isRowHeader>Estudiante</Table.Column>
            <Table.Column>Curso</Table.Column>
            <Table.Column>Evaluación</Table.Column>
            <Table.Column>Nota</Table.Column>
            <Table.Column>Fecha</Table.Column>
          </Table.Header>
          <Table.Body>
            {grades.map((g) => (
              <Table.Row key={g.id}>
                <Table.Cell>{g.student.firstName} {g.student.lastName}</Table.Cell>
                <Table.Cell>{g.course.name}</Table.Cell>
                <Table.Cell>{g.evaluationName}</Table.Cell>
                <Table.Cell>{g.grade}</Table.Cell>
                <Table.Cell>{g.evaluationDate?.toLocaleDateString("es-ES") ?? "—"}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  )
}
