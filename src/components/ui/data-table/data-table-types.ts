import type { Role } from "@/@types/roles";
import type { FilteringScopeHook } from "@/hooks/use-filtering-scope-hook";
import type React from "react";
export type SortDirection = "asc" | "desc" | null;

export interface Action<T> {
  label: string;
  onClick: (row: T) => void;
  icon?: React.ReactNode;
  type?: string;
  nonActive?: boolean;
}

export interface BulkAction {
  label: string;
  onClick: (selectedIndices: number[], clearSelection: () => void) => void;
  icon?: React.ReactNode;
  destructive?: boolean;
  active?: boolean;
}

export type DotNestedKeys<T> = T extends object
  ? {
      [K in Extract<keyof T, string>]: T[K] extends object
        ? `${K}` | `${K}.${DotNestedKeys<T[K]>}`
        : `${K}`;
    }[Extract<keyof T, string>]
  : never;
export interface Column<T> {
  key?: DotNestedKeys<T>;
  label: string;
  render?: (row: T) => React.ReactNode;
  align?: "left" | "right" | "center";
  sortable?: boolean;
  width?: string;
  search?: boolean;
}

export interface SearchableKey<T> {
  key?: DotNestedKeys<T>;
  label?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  bulkActions?: BulkAction[];
  hasBulkActions?: boolean;
  searchableKeys?: SearchableKey<T>[];
  perPageOptions?: number[];
  defaultPerPage?: number;
  onNew?: () => void;
  addingRole?: Role;
  filteringScopeHook?: FilteringScopeHook;
  title?: string;
  getChildren?: (row: T) => React.ReactNode;
  hasChildren?: boolean;
  height?: string;
  autoPaginate?: boolean;
  autoPaginateInterval?: number;
  headerActions?: React.ReactNode;
}
