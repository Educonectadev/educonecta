"use client"

import { Chip, Table } from "@heroui/react"

interface DisciplineRecord {
  id: number
  date: Date
  type: string
  description: string
  isResolved: boolean
  teacher: { user: { name: string } }
}

export default function DisciplineTable({
  records,
}: {
  records: DisciplineRecord[]
}) {
  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label="Tabla de disciplina" className="min-w-[600px]">
          <Table.Header>
            <Table.Column isRowHeader>Fecha</Table.Column>
            <Table.Column>Tipo</Table.Column>
            <Table.Column>Descripción</Table.Column>
            <Table.Column>Estado</Table.Column>
            <Table.Column>Registrado por</Table.Column>
          </Table.Header>
          <Table.Body>
            {records.map((r) => (
              <Table.Row key={r.id}>
                <Table.Cell>
                  {new Date(r.date).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Table.Cell>
                <Table.Cell>
                  <span
                    className="sa-chip text-xs font-medium"
                    style={{
                      color: "var(--muted-foreground)",
                      background: "var(--surface-3)",
                    }}
                  >
                    {r.type}
                  </span>
                </Table.Cell>
                <Table.Cell>{r.description}</Table.Cell>
                <Table.Cell>
                  {r.isResolved ? (
                    <Chip variant="soft" color="success">
                      Resuelto
                    </Chip>
                  ) : (
                    <Chip variant="soft" color="warning">
                      Pendiente
                    </Chip>
                  )}
                </Table.Cell>
                <Table.Cell>{r.teacher?.user?.name ?? "—"}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  )
}
