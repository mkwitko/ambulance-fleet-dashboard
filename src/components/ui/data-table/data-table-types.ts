import type React from "react"
export type SortDirection = "asc" | "desc" | null

export interface Action<T> {
  label: string
  onClick: (row: T) => void
  icon?: React.ReactNode
  type?: string
}

export interface BulkAction {
  label: string
  onClick: (selectedIndices: number[], clearSelection: () => void) => void
  icon?: React.ReactNode
  destructive?: boolean
  active?: boolean
}

export interface Column<T> {
  key: keyof T
  label: string
  render?: (row: T) => React.ReactNode
  align?: "left" | "right" | "center"
  sortable?: boolean
  width?: string
}

export interface SearchableKey<T> {
  key: keyof T
  label?: string
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  actions?: Action<T>[]
  bulkActions?: BulkAction[]
  hasBulkActions?: boolean
  searchableKeys?: SearchableKey<T>[]
  perPageOptions?: number[]
  defaultPerPage?: number
  onNew?: () => void
  title?: string
  getChildren?: (row: T) => React.ReactNode
  hasChildren?: (row: T) => boolean
}
