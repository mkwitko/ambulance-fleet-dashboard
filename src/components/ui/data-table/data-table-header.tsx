import { Search } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FilteringScope from "@/components/filtering-scope";
import type { FilteringScopeHook } from "@/hooks/use-filtering-scope-hook";
import type { Role } from "@/@types/roles";
import { useGetAuthenticatedUser } from "@/http/generated/user/user";
import { hasPermission } from "@/utils/permissions";

interface DataTableHeaderProps {
  title: string;
  query: string;
  onQueryChange: (value: string) => void;
  searchPlaceholder: string;
  onNew?: () => void;
  addingRole?: Role;
  filteringScopeHook?: FilteringScopeHook;
  headerActions?: React.ReactNode;
}

export function DataTableHeader({
  title,
  query,
  onQueryChange,
  searchPlaceholder,
  onNew,
  addingRole,
  filteringScopeHook,
  headerActions,
}: DataTableHeaderProps) {
  const { data: user } = useGetAuthenticatedUser({
    query: {
      enabled: !!addingRole,
    },
  });
  return (
    <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 space-y-0">
      <div className="flex items-center gap-4">
        <CardTitle className="bg-clip-text">{title}</CardTitle>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
        <div className="relative w-full sm:w-80 bg-white rounded-xl shadow-md hover:scale-[1.02] transition-all duration-200">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-10"
          />
        </div>

        {headerActions && headerActions}

        {filteringScopeHook && (
          <FilteringScope filteringScopeHook={filteringScopeHook} />
        )}

        {onNew && addingRole && hasPermission(user?.data, addingRole) && (
          <Button
            onClick={onNew}
            className="px-6 py-2 bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-200 font-medium"
          >
            Adicionar
          </Button>
        )}
      </div>
    </CardHeader>
  );
}
