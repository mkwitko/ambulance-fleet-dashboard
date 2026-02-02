import { Role } from "@/@types/roles";
import type {
  Action,
  Column,
} from "@/components/ui/data-table/data-table-types";
import type { GetModules200DataItem } from "@/http/generated/connectServer.schemas";
import { TranslatedModulesBillingType } from "@/utils/modules-billing-type";
import { Edit, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function useModulesData({
  handleDelete,
}: {
  handleDelete: (row: GetModules200DataItem) => void;
}) {
  const navigate = useNavigate();
  const columns: Column<GetModules200DataItem>[] = [
    { key: "name", label: "Nome" },
    {
      key: "billingValue",
      label: "Valor de Cobrança",
      render: (item: GetModules200DataItem) => {
        return item.billingValue.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
      },
    },
    {
      key: "billingType",
      label: "Tipo de Cobrança",
      render: (item: GetModules200DataItem) => {
        return (
          TranslatedModulesBillingType[item.billingType] || item.billingType
        );
      },
    },
  ];

  const actions: Action<GetModules200DataItem>[] = [
    {
      label: "Editar",
      onClick: (r: GetModules200DataItem) => navigate(r.id),
      icon: (
        <Edit className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      ),
      role: Role["base:update"],
    },
    {
      label: "Excluir",
      onClick: handleDelete,
      icon: (
        <Trash className="h-4 w-4 text-destructive group-hover:text-destructive-accent transition-colors" />
      ),
      type: "destructive",
      role: Role["base:delete"],
    },
  ];

  return {
    columns,
    actions,
  };
}
