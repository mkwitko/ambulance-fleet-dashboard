import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTablePaginationProps {
  page: number;
  totalPages: number;
  totalRecords: number;
  perPage: number;
  perPageOptions: number[];
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}

export function DataTablePagination({
  page,
  totalPages,
  totalRecords,
  perPage,
  perPageOptions,
  onPageChange,
  onPerPageChange,
}: DataTablePaginationProps) {
  return (
    <div className="sticky bottom-0 z-20 border-t border-border/60 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-6 py-4">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-accent-foreground">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary/70 animate-pulse shadow-sm shadow-primary/50" />
            <span className="font-medium">{totalRecords} registros</span>
          </div>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <span className="text-xs sm:text-sm">
            Página {page} de {totalPages}
          </span>
          <Select
            value={String(perPage)}
            onValueChange={(v) => onPerPageChange(Number(v))}
          >
            <SelectTrigger className="w-32 h-9 bg-background border-border shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {perPageOptions.map((opt) => (
                <SelectItem key={opt} value={String(opt)}>
                  {opt} por pág.
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => onPageChange(Math.max(page - 1, 1))}
            className="h-9 flex-1 sm:flex-none hover:bg-primary/5 hover:border-primary/50 transition-all disabled:opacity-50"
          >
            Anterior
          </Button>

          <Select
            value={String(page)}
            onValueChange={(v) => onPageChange(Number(v))}
          >
            <SelectTrigger className="w-20 h-9 border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <SelectItem key={idx} value={String(idx + 1)}>
                  {idx + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => onPageChange(Math.min(page + 1, totalPages))}
            className="h-9 flex-1 sm:flex-none hover:bg-primary/5 hover:border-primary/50 transition-all disabled:opacity-50"
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
}
