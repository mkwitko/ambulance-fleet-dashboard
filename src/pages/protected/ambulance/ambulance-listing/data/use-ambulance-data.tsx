import type {
  Action,
  Column,
} from "@/components/ui/data-table/data-table-types";
import type {
  GetAmbulances200,
  GetAmbulances200DataItem,
  SwitchAmbulanceStatusBodyStatus,
} from "@/http/generated/connectServer.schemas";
import { Edit, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AmbulanceDocumentStatus from "../ambulance-document-status";
import { AppSelect } from "@/components/app-select";
import { STATUS_LABELS } from "@/utils/ambulance-status";
import { useSwitchAmbulanceStatus } from "@/http/generated/ambulance/ambulance";
import { queryClient } from "@/lib/react-query";
import { toast } from "sonner";

export default function useAmbulanceData({
  handleDelete,
  queryKey,
}: {
  handleDelete: (row: GetAmbulances200DataItem) => void;
  queryKey: any;
}) {
  const { mutateAsync: switchAmbulanceStatus } = useSwitchAmbulanceStatus();
  const navigate = useNavigate();
  const columns: Column<GetAmbulances200DataItem>[] = [
    { key: "name", label: "Nome" },
    {
      key: "documents",
      label: "CRLV",
      render: (r) => {
        const crlv = r.documents.find((d) => d.type === "CRLV");
        return <AmbulanceDocumentStatus validUntil={crlv?.validUntil} />;
      },
      align: "center",
    },

    {
      key: "documents",
      label: "Alvará",
      render: (r) => {
        const alvara = r.documents.find((d) => d.type === "ALVARA");
        return <AmbulanceDocumentStatus validUntil={alvara?.validUntil} />;
      },
      align: "center",
    },
    {
      key: "company.name",
      label: "Empresa",
    },
    {
      key: "unit.name",
      label: "Unidade",
    },
    {
      key: "base.name",
      label: "Base",
    },
    {
      key: "licensePlate",
      label: "Placa",
    },
    {
      key: "status",
      label: "Status",
      render: (r) => {
        return (
          <AppSelect
            className="w-36"
            value={r.status}
            onValueChange={async (value: SwitchAmbulanceStatusBodyStatus) => {
              await switchAmbulanceStatus({
                id: r.id,
                data: { status: value },
              });
              await queryClient.setQueryData(
                queryKey,
                (ambulanceData: GetAmbulances200 | undefined) => {
                  if (!ambulanceData) return ambulanceData;
                  return {
                    ...ambulanceData,
                    data: ambulanceData.data.map((ambulance) =>
                      ambulance.id === r.id
                        ? { ...ambulance, status: value }
                        : ambulance
                    ),
                  };
                }
              );
              toast.success("Status da ambulância atualizado com sucesso.");
            }}
            items={Object.entries(STATUS_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
          />
        );
      },
    },
  ];

  const actions: Action<GetAmbulances200DataItem>[] = [
    {
      label: "Editar",
      onClick: (r: GetAmbulances200DataItem) => navigate(r.id),
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
