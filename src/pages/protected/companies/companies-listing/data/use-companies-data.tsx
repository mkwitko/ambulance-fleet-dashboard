import type {
  Action,
  Column,
} from "@/components/ui/data-table/data-table-types";
import type { GetCompanies200DataItem } from "@/http/generated/connectServer.schemas";
import { maskCnpj } from "@/utils/masks";
import { Edit, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function useCompaniesData({
  handleDelete,
}: {
  handleDelete: (row: GetCompanies200DataItem) => void;
}) {
  const navigate = useNavigate();
  const columns: Column<GetCompanies200DataItem>[] = [
    { key: "name", label: "Nome" },
    {
      key: "companyGroup.name",
      label: "Grupo Empresa",
    },
    {
      key: "document",
      label: "Documento",
      render: (value) => maskCnpj(value.document),
    },
  ];

  const actions: Action<GetCompanies200DataItem>[] = [
    {
      label: "Editar",
      onClick: (r: GetCompanies200DataItem) => navigate(r.id),
      icon: (
        <Edit className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      ),
    },
    {
      label: "Excluir",
      onClick: handleDelete,
      icon: (
        <Trash className="h-4 w-4 text-destructive group-hover:text-destructive-accent transition-colors" />
      ),
      type: "destructive",
    },
  ];

  return {
    columns,
    actions,
  };
}
