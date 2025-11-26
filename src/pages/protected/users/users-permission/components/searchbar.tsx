import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  hasSelectedPermissions: boolean;
}

export function SearchBar({
  searchQuery,
  onSearchChange,
  onSelectAll,
  onClearAll,
  hasSelectedPermissions,
}: SearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-linear-to-r from-slate-50 to-blue-50/50 p-4 rounded-xl border border-gray-200">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
        <Input
          placeholder="Buscar permissões ou recursos..."
          className="pl-11 h-11 rounded-xl border-gray-300 bg-white shadow-sm"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={onSelectAll}
          className="h-11 px-6 rounded-xl font-medium shadow-sm"
        >
          Selecionar Todas
        </Button>
        <Button
          variant="outline"
          onClick={onClearAll}
          disabled={!hasSelectedPermissions}
          className="h-11 px-6 rounded-xl font-medium"
        >
          Limpar
        </Button>
      </div>
    </div>
  );
}
