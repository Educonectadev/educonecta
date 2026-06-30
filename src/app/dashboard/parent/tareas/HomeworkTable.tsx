"use client"

import { Chip, Table } from "@heroui/react"

interface Homework {
  id: number
  title: string
  dueDate: Date
  course: { name: string }
  submissions: Array<{ studentId: number; submitted: boolean }>
}

interface ChildInfo {
  id: number
  firstName: string
  lastName: string
}

export default function HomeworkTable({
  homeworks,
  childInfo,
}: {
  homeworks: Homework[]
  childInfo: ChildInfo
}) {
  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content className="min-w-[600px]">
          <Table.Header>
            <Table.Column>Título</Table.Column>
            <Table.Column>Curso</Table.Column>
            <Table.Column>Fecha límite</Table.Column>
            <Table.Column>Estado</Table.Column>
          </Table.Header>
          <Table.Body>
            {homeworks.map((hw) => {
              const sub = hw.submissions.find(
                (s) => s.studentId === childInfo.id
              )
              const submitted = sub?.submitted ?? false
              const overdue = new Date(hw.dueDate) < new Date()
              return (
                <Table.Row key={hw.id}>
                  <Table.Cell>{hw.title}</Table.Cell>
                  <Table.Cell>{hw.course.name}</Table.Cell>
                  <Table.Cell>
                    {new Date(hw.dueDate).toLocaleDateString("es-ES")}
                  </Table.Cell>
                  <Table.Cell>
                    {submitted ? (
                      <Chip variant="soft" color="success">
                        Entregado
                      </Chip>
                    ) : overdue ? (
                      <Chip variant="soft" color="danger">
                        Vencido
                      </Chip>
                    ) : (
                      <Chip variant="soft" color="warning">
                        Pendiente
                      </Chip>
                    )}
                  </Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  )
}
