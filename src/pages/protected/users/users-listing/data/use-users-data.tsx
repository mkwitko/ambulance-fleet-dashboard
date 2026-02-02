import { Role } from "@/@types/roles";
import type {
  Action,
  Column,
} from "@/components/ui/data-table/data-table-types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { GetUsers200DataItem } from "@/http/generated/connectServer.schemas";
import { Book, Edit, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";

function truncate(text: string, limit = 20) {
  if (!text) return "";
  return text.length > limit ? text.slice(0, limit) + "..." : text;
}

export default function useUsersData({
  handleDelete,
}: {
  handleDelete: (row: GetUsers200DataItem) => void;
}) {
  const navigate = useNavigate();

  const columns: Column<GetUsers200DataItem>[] = [
    { key: "name", label: "Nome" },
    {
      key: "mail",
      label: "E-mail",
    },

    // --- GRUPO EMPRESA ---
    {
      key: "companyGroup",
      label: "Grupo Empresa",
      render: (value) => {
        const text = value.companyGroup?.name || "";
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>{truncate(text, 20)}</TooltipTrigger>
              <TooltipContent>{text}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },

    // --- EMPRESAS ---
    {
      key: "companies",
      label: "Empresas",
      render: (value) => {
        const fullText = value.companies?.map((c) => c.name).join(", ") || "";
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>{truncate(fullText, 25)}</TooltipTrigger>
              <TooltipContent>{fullText}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },

    // --- UNIDADES ---
    {
      key: "units",
      label: "Unidades",
      render: (value) => {
        const fullText = value.units?.map((u) => u.name).join(", ") || "";
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>{truncate(fullText, 25)}</TooltipTrigger>
              <TooltipContent>{fullText}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
  ];

  const actions: Action<GetUsers200DataItem>[] = [
    {
      label: "Editar",
      onClick: (r: GetUsers200DataItem) => navigate(r.id),
      icon: (
        <Edit className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      ),
      role: Role["user:update"],
    },
    {
      label: "Permissões",
      onClick: (r: GetUsers200DataItem) => navigate(`${r.id}/permissions`),
      icon: (
        <Book className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      ),
      role: Role["user:assignRole"],
    },
    {
      label: "Excluir",
      onClick: handleDelete,
      icon: (
        <Trash className="h-4 w-4 text-destructive group-hover:text-destructive-accent transition-colors" />
      ),
      type: "destructive",
      role: Role["user:delete"],
    },
  ];

  return {
    columns,
    actions,
  };
}
