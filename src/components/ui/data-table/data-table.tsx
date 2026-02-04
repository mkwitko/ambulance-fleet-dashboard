import React, { useEffect, useMemo } from "react";
import Fuse from "fuse.js";
import { AnimatePresence, motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataTableHeader } from "./data-table-header";
import { DataTableToolbar } from "./data-table-toolbar";
import { DataTableRow } from "./data-table-row";
import { DataTablePagination } from "./data-table-pagination";
import type { DataTableProps, SortDirection } from "./data-table-types";
import { useGetAuthenticatedUserPermissions } from "@/http/generated/user/user";
import type { Role } from "@/@types/roles";
import { hasPermission } from "@/utils/permissions";

export function DataTable<
  T extends Record<string, any>,
  P extends Record<string, any> = Record<string, any>,
>({
  data,
  pagination,
  columns,
  actions = [],
  bulkActions = [],
  searchableKeys = [],
  perPageOptions = [10, 20, 50, 100],
  defaultPerPage = 10,
  onNew,
  addingRole,
  filteringScopeHook,
  title = "Tabela",
  getChildren,
  hasChildren,
  height = "520px",
  autoPaginate = false,
  autoPaginateInterval = 5000,
  headerActions,
  onPageChange,
  onPerPageChange,
}: DataTableProps<T, P>) {
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(defaultPerPage);
  const [selected, setSelected] = React.useState<Set<number>>(new Set());
  const [sortKey, setSortKey] = React.useState<keyof T | null>(null);
  const [sortDir, setSortDir] = React.useState<SortDirection>(null);
  const [expanded, setExpanded] = React.useState<Set<number>>(new Set());

  useEffect(() => {
    if (onPageChange) onPageChange(page);
  }, [page]);

  useEffect(() => {
    if (onPerPageChange) onPerPageChange(perPage);
  }, [perPage]);

  const { data: userPermissions } = useGetAuthenticatedUserPermissions();

  const fuse = useMemo(() => {
    if (!searchableKeys.length) return null;
    return new Fuse(data, {
      keys: searchableKeys.map((s) => String(s.key)),
      threshold: 0.3,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });
  }, [data, searchableKeys]);

  const filtered = useMemo(() => {
    if (!query) return data.slice();
    if (!fuse) return data.slice();
    return fuse.search(query).map((r) => r.item);
  }, [data, query, fuse]);

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered;
    return [...filtered].sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (va == null && vb == null) return 0;
      if (va == null) return sortDir === "asc" ? -1 : 1;
      if (vb == null) return sortDir === "asc" ? 1 : -1;
      if (typeof va === "number" && typeof vb === "number") {
        return sortDir === "asc" ? va - vb : vb - va;
      }
      return sortDir === "asc"
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = pagination?.totalPages;

  const toggleRow = (idx: number) => {
    const s = new Set(selected);
    if (s.has(idx)) s.delete(idx);
    else s.add(idx);
    setSelected(s);
  };

  const toggleAll = () => {
    if (selected.size === data.length && data.length > 0) {
      setSelected(new Set());
    } else {
      const s = new Set<number>();
      data.forEach((_, i) => s.add((page - 1) * perPage + i));
      setSelected(s);
    }
  };

  const clearSelection = () => setSelected(new Set());

  const toggleExpand = (idx: number) => {
    const s = new Set(expanded);
    if (s.has(idx)) s.delete(idx);
    else s.add(idx);
    setExpanded(s);
  };

  const handleSort = (key: keyof T) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
      return;
    }
    if (sortDir === "asc") setSortDir("desc");
    else if (sortDir === "desc") {
      setSortKey(null);
      setSortDir(null);
    } else setSortDir("asc");
  };

  const readableFilters =
    searchableKeys.length > 0
      ? searchableKeys.map((k) => k.label ?? String(k.key)).join(", ")
      : "";

  const hasBulkActions = bulkActions.length > 0;

  const filteredActions = actions.filter(
    (a) => !a.nonActive && hasPermission(userPermissions?.data, a.role as Role),
  );
  const hasActions = actions.length > 0 && filteredActions.length > 0;

  // --- AUTO PAGINATION ---
  React.useEffect(() => {
    if (!autoPaginate) return;
    if (totalPages <= 1) return;

    const interval = setInterval(() => {
      setPage((prev) => {
        if (prev >= totalPages) return 1;
        return prev + 1;
      });
    }, autoPaginateInterval || 5000); // default 5s

    return () => clearInterval(interval);
  }, [autoPaginate, autoPaginateInterval, totalPages]);

  return (
    <>
      <Card className="bg-connect shadow-md overflow-hidden">
        <DataTableHeader
          title={title}
          query={query}
          onQueryChange={(value) => {
            setQuery(value);
            setPage(1);
            clearSelection();
          }}
          searchPlaceholder={`Buscar ${readableFilters || "..."}`}
          filteringScopeHook={filteringScopeHook}
          onNew={onNew}
          addingRole={addingRole}
          headerActions={headerActions}
        />

        <CardContent className="px-0 sm:px-4 pb-0">
          <AnimatePresence>
            {selected.size > 0 && (
              <DataTableToolbar
                selectedCount={selected.size}
                onClearSelection={clearSelection}
                bulkActions={bulkActions}
                selectedIndices={Array.from(selected)}
                clearSelection={clearSelection}
              />
            )}
          </AnimatePresence>

          <div className="relative overflow-hidden">
            <div className="overflow-x-auto">
              <div className={`min-h-[${height}] overflow-y-auto`}>
                <Table className="min-w-full min-h-full">
                  <TableHeader className="sticky top-0 z-10">
                    <TableRow>
                      {hasChildren && getChildren && (
                        <TableHead className="w-12" />
                      )}

                      {hasBulkActions && (
                        <TableHead className="w-14">
                          <Checkbox
                            checked={
                              selected.size === data.length && data.length > 0
                            }
                            onCheckedChange={toggleAll}
                            aria-label="Selecionar todos"
                          />
                        </TableHead>
                      )}

                      {columns.map((col, index) => (
                        <TableHead
                          key={
                            col.key ? String(col.key) : `${col.label}-${index}`
                          }
                          className={cn(
                            col.align === "right"
                              ? "text-right"
                              : col.align === "center"
                                ? "text-center"
                                : "text-left",
                            "select-none font-semibold text-xs uppercase tracking-wider text-accent-foreground",
                            col.width,
                          )}
                        >
                          {col.sortable ? (
                            <button
                              className="flex items-center gap-2 hover:text-foreground transition-colors group"
                              onClick={() => col.key && handleSort(col.key)}
                            >
                              <span>{col.label}</span>
                              <ArrowUpDown
                                className={cn(
                                  "h-3.5 w-3.5 transition-all duration-200",
                                  sortKey === col.key
                                    ? "text-primary scale-110"
                                    : "text-accent-foreground group-hover:text-foreground group-hover:scale-105",
                                )}
                              />
                            </button>
                          ) : (
                            <span>{col.label}</span>
                          )}
                        </TableHead>
                      ))}

                      {hasActions && (
                        <TableHead className="w-20 text-right font-semibold text-xs uppercase tracking-wider text-accent-foreground">
                          Ações
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filtered.length === 0 ? (
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td
                          colSpan={
                            columns.length +
                            (filteredActions.length > 0 ? 1 : 0) +
                            (hasBulkActions ? 1 : 0) +
                            (hasChildren ? 1 : 0)
                          }
                          className="h-100 text-center align-middle"
                        >
                          <div className="flex flex-col items-center justify-center gap-2 text-accent-foreground/70">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-10 w-10 text-accent-foreground"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={1.5}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9.75 9.75h4.5m-4.5 4.5h4.5m6-9V18a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 18V6a2.25 2.25 0 012.25-2.25h10.5A2.25 2.25 0 0119.5 6z"
                              />
                            </svg>
                            <div className="space-y-1">
                              <p className="text-sm font-medium">
                                Nenhum resultado encontrado
                              </p>
                              {query && (
                                <p className="text-xs text-accent-foreground/50">
                                  Tente ajustar sua busca ou filtros.
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    ) : (
                      filtered.map((row, i) => {
                        const globalIndex = (page - 1) * perPage + i;
                        const isExpanded = expanded.has(globalIndex);

                        return (
                          <DataTableRow
                            key={globalIndex}
                            row={row}
                            index={i}
                            globalIndex={globalIndex}
                            columns={columns}
                            actions={filteredActions}
                            isSelected={selected.has(globalIndex)}
                            isExpanded={isExpanded}
                            hasChildren={hasChildren || false}
                            onToggleSelect={() => toggleRow(globalIndex)}
                            onToggleExpand={() => toggleExpand(globalIndex)}
                            getChildren={getChildren}
                            hasBulkActions={hasBulkActions}
                          />
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <DataTablePagination
              page={page}
              totalPages={totalPages}
              totalRecords={sorted.length}
              perPage={perPage}
              perPageOptions={perPageOptions}
              onPageChange={(newPage) => {
                setPage(newPage);
              }}
              onPerPageChange={(newPerPage) => {
                setPerPage(newPerPage);
                setPage(1);
              }}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
