"use client"

import type { SortDescriptor } from "@heroui/react"
import { useMemo, useState } from "react"
import { Button } from "@heroui/react"
import { Icon } from "@iconify/react"

interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  width?: string
  render?: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onRowClick?: (item: T) => void
  renderCard?: (item: T) => React.ReactNode
  emptyMessage?: string
}

export default function DataTable<T extends { id: number }>({
  columns,
  data,
  onEdit,
  onDelete,
  onRowClick,
  renderCard,
  emptyMessage = "No hay registros.",
}: DataTableProps<T>) {
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: columns[0]?.key,
    direction: "ascending",
  })

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const col = sortDescriptor.column as string
      const first = String((a as any)[col] ?? "")
      const second = String((b as any)[col] ?? "")
      let cmp = first.localeCompare(second)
      if (sortDescriptor.direction === "descending") cmp *= -1
      return cmp
    })
  }, [data, sortDescriptor])

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-12 text-center">
        <span className="material-icons text-4xl text-gray-300 dark:text-zinc-600 mb-3">inbox</span>
        <p className="text-sm text-gray-400 dark:text-zinc-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
      {renderCard && (
        <div className="grid gap-3 md:hidden p-4">
          {sorted.map((item) => (
            <div
              key={item.id}
              onClick={() => onRowClick?.(item)}
              className={`bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-[25px] p-5 space-y-3 ${onRowClick ? "cursor-pointer" : ""}`}
            >
              {renderCard(item)}
            </div>
          ))}
        </div>
      )}
      <div className={`overflow-x-auto ${renderCard ? "hidden md:block" : ""}`}>
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-100 dark:border-zinc-800">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500 px-4 py-3.5 ${col.width || ""}`}
                >
                  {col.sortable ? (
                    <button
                      className="flex items-center gap-1 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
                      onClick={() =>
                        setSortDescriptor({
                          column: col.key,
                          direction:
                            sortDescriptor.column === col.key &&
                            sortDescriptor.direction === "ascending"
                              ? "descending"
                              : "ascending",
                        })
                      }
                    >
                      {col.label}
                      {sortDescriptor.column === col.key && (
                        <span className="material-icons text-xs">
                          {sortDescriptor.direction === "ascending"
                            ? "arrow_upward"
                            : "arrow_downward"}
                        </span>
                      )}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500 px-4 py-3.5 w-24">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {sorted.map((item) => (
              <tr key={item.id} className={`border-b border-gray-50 dark:border-zinc-800/50 hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors last:border-b-0 ${onRowClick ? "cursor-pointer" : ""}`} onClick={() => onRowClick?.(item)}>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm">
                    {col.render
                      ? col.render(item)
                      : String((item as any)[col.key] ?? "—")}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {onEdit && (
                        <Button isIconOnly size="sm" variant="tertiary" onPress={() => onEdit(item)}>
                          <Icon className="size-4 text-gray-400" icon="gravity-ui:pencil" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button isIconOnly size="sm" variant="danger-soft" onPress={() => onDelete(item)}>
                          <Icon className="size-4" icon="gravity-ui:trash-bin" />
                        </Button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
