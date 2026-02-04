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
import type { GetDrivers200DataItem } from "@/http/generated/connectServer.schemas";
import { Edit, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";

function truncate(text: string, limit = 20) {
  if (!text) return "";
  return text.length > limit ? text.slice(0, limit) + "..." : text;
}

export default function useDriversData({
  handleDelete,
}: {
  handleDelete: (row: GetDrivers200DataItem) => void;
}) {
  const navigate = useNavigate();

  const columns: Column<GetDrivers200DataItem>[] = [
    { key: "name", label: "Nome" },
    { key: "logFrotaId", label: "ID LogFrota", align: "center" },
    // --- GRUPO EMPRESA ---
    {
      key: "companyGroup",
      label: "Grupo Empresa",
      render: (value) => {
        const fullText =
          value.companyGroup?.map((c) => c.name).join(", ") || "";
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
    // {
    //   key: "units",
    //   label: "Unidades",
    //   render: (value) => {
    //     const fullText = value.units?.map((u) => u.name).join(", ") || "";
    //     return (
    //       <TooltipProvider>
    //         <Tooltip>
    //           <TooltipTrigger>{truncate(fullText, 25)}</TooltipTrigger>
    //           <TooltipContent>{fullText}</TooltipContent>
    //         </Tooltip>
    //       </TooltipProvider>
    //     );
    //   },
    // },
  ];

  const actions: Action<GetDrivers200DataItem>[] = [
    {
      label: "Editar",
      onClick: (r: GetDrivers200DataItem) => navigate(r.id),
      icon: (
        <Edit className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      ),
      role: Role["driver:update"],
    },
    {
      label: "Excluir",
      onClick: handleDelete,
      icon: (
        <Trash className="h-4 w-4 text-destructive group-hover:text-destructive-accent transition-colors" />
      ),
      type: "destructive",
      role: Role["driver:delete"],
    },
  ];

  return {
    columns,
    actions,
  };
}
