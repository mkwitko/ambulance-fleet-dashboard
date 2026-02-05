import { Role } from "@/@types/roles";
import type {
  Action,
  Column,
} from "@/components/ui/data-table/data-table-types";
import type { GetCompanyGroups200DataItem } from "@/http/generated/connect-server.schemas";
import { maskCnpj } from "@/utils/masks";
import { Edit, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function useCompanyGroupAdminData({
  handleDelete,
}: {
  handleDelete: (row: GetCompanyGroups200DataItem) => void;
}) {
  const navigate = useNavigate();
  const columns: Column<GetCompanyGroups200DataItem>[] = [
    { key: "name", label: "Nome" },
    {
      key: "document",
      label: "Documento",
      render: (item) => maskCnpj(item.document),
    },
  ];

  const actions: Action<GetCompanyGroups200DataItem>[] = [
    {
      label: "Editar",
      onClick: (r: GetCompanyGroups200DataItem) => navigate(r.id),
      icon: (
        <Edit className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      ),
      role: Role["companyGroup:update"],
    },
    {
      label: "Excluir",
      onClick: handleDelete,
      icon: (
        <Trash className="h-4 w-4 text-destructive group-hover:text-destructive-accent transition-colors" />
      ),
      type: "destructive",
      role: Role["sys_admin:accessAll"],
    },
  ];

  return {
    columns,
    actions,
  };
}
