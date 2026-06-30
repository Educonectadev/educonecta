"use client"

import { Chip, Table } from "@heroui/react"

interface Attendance {
  id: number
  date: string | Date
  isPresent: boolean
  note: string | null
  student: { firstName: string; lastName: string }
}

export default function RecentAttendanceTable({ recentAttendance }: { recentAttendance: Attendance[] }) {
  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content className="min-w-[600px]">
          <Table.Header>
            <Table.Column isRowHeader>Estudiante</Table.Column>
            <Table.Column>Fecha</Table.Column>
            <Table.Column>Presente</Table.Column>
            <Table.Column>Nota</Table.Column>
          </Table.Header>
          <Table.Body>
            {recentAttendance.map((a) => {
              const dateStr = typeof a.date === "string" ? a.date : a.date.toISOString().substring(0, 10)
              const dateObj = new Date(dateStr)
              return (
                <Table.Row key={a.id}>
                  <Table.Cell>{a.student.firstName} {a.student.lastName}</Table.Cell>
                  <Table.Cell>{dateObj.toLocaleDateString("es-ES")}</Table.Cell>
                  <Table.Cell>
                    <Chip variant="soft" color={a.isPresent ? "success" : "danger"}>
                      {a.isPresent ? "Presente" : "Ausente"}
                    </Chip>
                  </Table.Cell>
                  <Table.Cell>{a.note ?? "—"}</Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  )
}
