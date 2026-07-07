"use client"

import { useMemo, useState } from "react"
import { getIcon } from "@/components/premium/iconRegistry"

interface Column<T> {
  key: string
  label: string
  sortable?: boolean
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
}

export default function DataTable<T extends { id: number }>({
  columns,
  data,
  onEdit,
  onDelete,
  onRowClick,
  emptyMessage = "No hay registros.",
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState(columns[0]?.key ?? "")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  const hasActions = !!onEdit || !!onDelete

  const sorted = useMemo(() => {
    if (!sortKey) return data
    return [...data].sort((a, b) => {
      const first = String((a as any)[sortKey] ?? "")
      const second = String((b as any)[sortKey] ?? "")
      let cmp = first.localeCompare(second)
      if (sortDir === "desc") cmp *= -1
      return cmp
    })
  }, [data, sortKey, sortDir])

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  if (data.length === 0) {
    return (
      <div className="sa-surface py-14 md:py-16 text-center">
        <div className="size-12 rounded-2xl mx-auto flex items-center justify-center bg-[var(--surface-3)] text-[var(--muted-foreground)] mb-3">
          {getIcon("inbox", { size: 20 })}
        </div>
        <p className="text-sm font-medium text-[var(--foreground)]">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="sa-surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--surface-border)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] px-4 py-3 ${
                    col.sortable ? "cursor-pointer hover:text-[var(--foreground)] transition-colors select-none" : ""
                  } ${col.className ?? ""}`}
                  onClick={col.sortable ? () => toggleSort(col.key) : undefined}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      <span className="text-[10px]">{sortDir === "asc" ? "▲" : "▼"}</span>
                    )}
                  </span>
                </th>
              ))}
              {hasActions && <th className="text-right text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] px-4 py-3">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {sorted.map((item, idx) => (
              <tr
                key={item.id}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
                className={`border-b border-[var(--surface-border)] last:border-b-0 transition-colors ${
                  onRowClick ? "cursor-pointer" : ""
                } hover:bg-[var(--surface-2)]`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3.5 text-sm text-[var(--foreground)] ${col.className ?? ""}`}>
                    {col.render ? col.render(item) : String((item as any)[col.key] ?? "—")}
                  </td>
                ))}
                {hasActions && (
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {onEdit && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onEdit(item) }}
                          className="size-8 rounded-xl flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] transition-colors"
                          aria-label="Editar"
                        >
                          {getIcon("edit", { size: 15 })}
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onDelete(item) }}
                          className="size-8 rounded-xl flex items-center justify-center text-[var(--muted-foreground)] hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors"
                          aria-label="Eliminar"
                        >
                          {getIcon("trash", { size: 15 })}
                        </button>
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
