"use client"

import type { Selection, SortDescriptor } from "@heroui/react"
import { Button, Checkbox, EmptyState, Table } from "@heroui/react"
import { Icon } from "@iconify/react"
import { useMemo, useState } from "react"

interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  width?: string
  className?: string
  render?: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onRowClick?: (item: T) => void
  emptyMessage?: string
  selectionMode?: "none" | "single" | "multiple"
}

export default function DataTable<T extends { id: number }>({
  columns,
  data,
  onEdit,
  onDelete,
  onRowClick,
  emptyMessage = "No hay registros.",
  selectionMode = "none",
}: DataTableProps<T>) {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set())
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: columns[0]?.key,
    direction: "ascending",
  })

  const sorted = useMemo(() => {
    const col = sortDescriptor.column as string
    if (!col) return data
    return [...data].sort((a, b) => {
      const first = String((a as any)[col] ?? "")
      const second = String((b as any)[col] ?? "")
      let cmp = first.localeCompare(second)
      if (sortDescriptor.direction === "descending") cmp *= -1
      return cmp
    })
  }, [data, sortDescriptor])

  const hasActions = !!onEdit || !!onDelete

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content
          className="min-w-[600px]"
          selectedKeys={selectedKeys}
          selectionMode={selectionMode === "none" ? undefined : selectionMode}
          sortDescriptor={sortDescriptor}
          onSelectionChange={setSelectedKeys}
          onSortChange={setSortDescriptor}
        >
          <Table.Header>
            {selectionMode !== "none" && (
              <Table.Column className="w-10 pr-0"> </Table.Column>
            )}
            {columns.map((col) => (
              <Table.Column
                key={col.key}
                id={col.key}
                allowsSorting={col.sortable}
                isRowHeader={col.key === columns[0]?.key}
                className={col.className}
              >
                {col.sortable
                  ? ({ sortDirection }: any) => (
                      <Table.SortableColumnHeader sortDirection={sortDirection}>
                        {col.label}
                      </Table.SortableColumnHeader>
                    )
                  : col.label
                }
              </Table.Column>
            ))}
            {hasActions && (
              <Table.Column className="text-end">Acciones</Table.Column>
            )}
          </Table.Header>
          <Table.Body
            renderEmptyState={() => (
              <EmptyState
                aria-label="Sin resultados"
                className="flex h-full w-full flex-col items-center justify-center gap-4 text-center py-12"
              >
                <Icon
                  className="size-8 text-zinc-300 dark:text-zinc-600"
                  icon="gravity-ui:tray"
                />
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {emptyMessage}
                </span>
              </EmptyState>
            )}
          >
            {sorted.map((item) => (
              <Table.Row
                key={item.id}
                id={item.id}
                onAction={onRowClick ? () => onRowClick(item) : undefined}
              >
                {selectionMode !== "none" && (
                  <Table.Cell className="pr-0">
                    <Checkbox aria-label={`Select ${item.id}`} slot="selection" variant="secondary" />
                  </Table.Cell>
                )}
                {columns.map((col) => (
                  <Table.Cell key={col.key}>
                    {col.render ? col.render(item) : String((item as any)[col.key] ?? "—")}
                  </Table.Cell>
                ))}
                {hasActions && (
                  <Table.Cell>
                    <div className="flex items-center justify-end gap-1">
                      {onEdit && (
                        <Button
                          isIconOnly
                          size="sm"
                          variant="tertiary"
                          aria-label="Editar"
                          onPress={() => onEdit(item)}
                        >
                          <Icon className="size-4" icon="gravity-ui:pencil" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          isIconOnly
                          size="sm"
                          variant="danger-soft"
                          aria-label="Eliminar"
                          onPress={() => onDelete(item)}
                        >
                          <Icon className="size-4" icon="gravity-ui:trash-bin" />
                        </Button>
                      )}
                    </div>
                  </Table.Cell>
                )}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  )
}
