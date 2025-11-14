import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { BulkAction } from "./data-table-types";

interface DataTableToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  bulkActions: BulkAction[];
  selectedIndices: number[];
  clearSelection: () => void;
}

export function DataTableToolbar({
  selectedCount,
  onClearSelection,
  bulkActions,
  selectedIndices,
  clearSelection,
}: DataTableToolbarProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 overflow-hidden rounded-t-lg"
    >
      <div className="flex flex-wrap items-center gap-3">
        <motion.span
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="text-sm font-semibold text-primary"
        >
          {selectedCount} selecionado{selectedCount > 1 ? "s" : ""}
        </motion.span>
        <div className="h-4 w-px bg-border" />
        <div className="flex flex-wrap gap-2">
          {bulkActions.map((action, i) => (
            <Button
              key={i}
              variant={action.destructive ? "destructive" : "default"}
              size="sm"
              onClick={() => action.onClick(selectedIndices, clearSelection)}
              className="h-9 text-sm transition-all duration-200"
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </Button>
          ))}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearSelection}
        className="h-9 text-sm hover:bg-primary/10"
      >
        Limpar seleção
      </Button>
    </motion.div>
  );
}
