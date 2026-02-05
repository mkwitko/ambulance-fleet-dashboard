import { Role } from "@/@types/roles";
import type {
  Action,
  Column,
} from "@/components/ui/data-table/data-table-types";
import type { GetUnits200DataItem } from "@/http/generated/connect-server.schemas";
import { Edit, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function useUnitsData({
  handleDelete,
}: {
  handleDelete: (row: GetUnits200DataItem) => void;
}) {
  const navigate = useNavigate();
  const columns: Column<GetUnits200DataItem>[] = [
    { key: "name", label: "Nome" },
    {
      key: "companyGroup.name",
      label: "Grupo Empresa",
    },
    {
      key: "company.name",
      label: "Empresa",
    },
  ];

  const actions: Action<GetUnits200DataItem>[] = [
    {
      label: "Editar",
      onClick: (r: GetUnits200DataItem) => navigate(r.id),
      icon: (
        <Edit className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      ),
      role: Role["unit:update"],
    },
    {
      label: "Excluir",
      onClick: handleDelete,
      icon: (
        <Trash className="h-4 w-4 text-destructive group-hover:text-destructive-accent transition-colors" />
      ),
      type: "destructive",
      role: Role["unit:delete"],
    },
  ];

  return {
    columns,
    actions,
  };
}
