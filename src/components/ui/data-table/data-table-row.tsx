import type React from "react";
import { motion } from "framer-motion";
import { TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Action, Column } from "./data-table-types";
import { useState } from "react";

interface DataTableRowProps<T> {
  row: T;
  index: number;
  globalIndex: number;
  columns: Column<T>[];
  actions: Action<T>[];
  isSelected: boolean;
  isExpanded: boolean;
  hasChildren: boolean;
  onToggleSelect: () => void;
  onToggleExpand: () => void;
  getChildren?: (row: T) => React.ReactNode;
  hasBulkActions?: boolean;
}

export function DataTableRow<T extends Record<string, any>>({
  row,
  index,
  globalIndex,
  columns,
  actions,
  isSelected,
  isExpanded,
  hasChildren,
  onToggleSelect,
  onToggleExpand,
  getChildren,
  hasBulkActions,
}: DataTableRowProps<T>) {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  return (
    <>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Tem certeza que deseja remover este item?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso irá excluir permanentemente
              este item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingAction) {
                  pendingAction();
                  setPendingAction(null);
                }
                setIsAlertOpen(false);
              }}
            >
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <motion.tr
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.22, delay: index * 0.02 }}
        className={cn(
          // Base
          "relative border-b border-border/50",

          // Zebra com gradiente sutil
          index % 2 === 0
            ? "bg-gradient-to-r from-muted/30 to-muted/20"
            : "bg-background",

          // Selecionado - efeito mais pronunciado
          isSelected && [
            "bg-gradient-to-r from-primary/20 via-primary/15 to-primary/10",
            "border-l-[3px] border-l-primary",
            "shadow-[inset_0_0_12px_rgba(var(--primary),0.1)]",
            "after:absolute after:inset-0 after:bg-primary/5 after:pointer-events-none",
          ],

          // Expandido
          isExpanded && [
            "bg-gradient-to-br from-primary/10 via-accent/5 to-background",
            "shadow-inner",
          ],

          // Hover - gradiente animado
          !isSelected && [
            "hover:bg-gradient-to-r hover:from-primary/8 hover:via-accent/5 hover:to-transparent",
            "hover:shadow-sm hover:shadow-primary/5",
            "hover:border-primary/20",
          ],

          // Transições suaves
          "transition-all duration-300 ease-out",
          "group cursor-pointer"
        )}
      >
        {hasChildren && (
          <TableCell className="w-12 py-4 pl-4">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-lg transition-all duration-200",
                "hover:bg-primary/10 hover:scale-110",
                "active:scale-95",
                isExpanded && "bg-primary/15 text-primary"
              )}
              onClick={onToggleExpand}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <ChevronRight className="h-4 w-4" />
              </motion.div>
            </Button>
          </TableCell>
        )}

        {hasBulkActions && (
          <TableCell className="w-14 py-4 pl-4">
            <div className="flex items-center justify-center">
              <Checkbox
                checked={isSelected}
                onCheckedChange={onToggleSelect}
                aria-label={`Selecionar linha ${globalIndex}`}
                className={cn(
                  "h-5 w-5 rounded-md border-2 transition-all duration-200",
                  "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
                  "data-[state=checked]:scale-110",
                  "hover:border-primary/50 hover:scale-105",
                  "focus-visible:ring-2 focus-visible:ring-primary/30"
                )}
              />
            </div>
          </TableCell>
        )}

        {columns.map((col) => (
          <TableCell
            key={String(col.key)}
            className={cn(
              col.align === "right"
                ? "text-right"
                : col.align === "center"
                ? "text-center"
                : "text-left",
              "py-4"
            )}
          >
            <div
              className={cn(
                "flex items-center gap-2.5",
                col.align === "right" && "justify-end",
                col.align === "center" && "justify-center"
              )}
            >
              <span
                className={cn(
                  "truncate text-sm font-medium",
                  "text-foreground/70",
                  "group-hover:text-foreground transition-colors duration-200"
                )}
              >
                {col.render ? col.render(row) : String(row[col.key] ?? "—")}
              </span>
            </div>
          </TableCell>
        ))}

        {actions.length > 0 && (
          <TableCell className="text-right w-14 pr-4">
            <DropdownMenu open={openDropdown} onOpenChange={setOpenDropdown}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-9 w-9 rounded-xl",
                    "hover:bg-accent/80 hover:text-primary",
                    "active:scale-95",
                    "transition-all duration-200",
                    "opacity-30 group-hover:opacity-100",
                    "focus-visible:opacity-100"
                  )}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className={cn(
                  "w-52 rounded-xl p-2",
                  "border border-border/60 shadow-xl shadow-black/10",
                  "bg-background/95 backdrop-blur-md"
                )}
              >
                {actions.map((action, k) => (
                  <motion.div
                    key={k}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: k * 0.04 }}
                  >
                    <DropdownMenuItem
                      onClick={() => {
                        if (action.type === "destructive") {
                          setOpenDropdown(false);
                          setPendingAction(() => () => action.onClick(row));
                          setTimeout(() => setIsAlertOpen(true), 100);
                        } else {
                          action.onClick(row);
                        }
                      }}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                        "text-sm font-medium cursor-pointer",
                        "transition-all duration-200",
                        "hover:bg-accent active:scale-[0.97]",
                        action.type === "destructive" && [
                          "text-destructive",
                          "hover:bg-destructive/10",
                          "focus:bg-destructive/10",
                        ]
                      )}
                    >
                      {action.icon && (
                        <span className="shrink-0 opacity-70">
                          {action.icon}
                        </span>
                      )}
                      <span>{action.label}</span>
                    </DropdownMenuItem>
                  </motion.div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        )}
      </motion.tr>

      {isExpanded && getChildren && (
        <motion.tr
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <TableCell
            colSpan={
              columns.length +
              (actions.length > 0 ? 2 : 1) +
              (hasChildren ? 1 : 0)
            }
            className="bg-gradient-to-r from-accent/30 via-accent/20 to-transparent p-0 border-b border-border/50"
          >
            <motion.div
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="px-8 py-6"
            >
              {getChildren(row)}
            </motion.div>
          </TableCell>
        </motion.tr>
      )}
    </>
  );
}
