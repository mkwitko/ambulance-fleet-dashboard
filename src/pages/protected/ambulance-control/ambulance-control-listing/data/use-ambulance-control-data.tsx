import type { Column } from "@/components/ui/data-table/data-table-types";
import type { GetAmbulancesControl200DataItem } from "@/http/generated/connect-server.schemas";
import { getStatusStyle } from "@/utils/ambulance-status";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { formatDateBrazilian } from "@/utils/format-date";

export default function useAmbulanceData() {
  const columns: Column<GetAmbulancesControl200DataItem>[] = [
    { key: "name", label: "Nome", search: true },
    { key: "observations", label: "Observação" },
    { key: "base.name", label: "Base", search: true },
    {
      key: "ambulanceShiftHistories",
      label: "Entrada",
      render: (r) => {
        const entry = r.ambulanceShiftHistories?.[0];
        return entry ? formatDateBrazilian(entry.shiftStart) : "-";
      },
    },
    {
      key: "ambulanceShiftHistories",
      label: "Saída",
      render: (r) => {
        const entry = r.ambulanceShiftHistories?.[0];
        return entry ? formatDateBrazilian(entry.shiftEnd) : "-";
      },
    },
    {
      key: "status",
      label: "Status",
      render: (r) => {
        return (
          <Badge
            variant="outline"
            className={cn("text-[0.625rem]", getStatusStyle(r.status))}
          >
            {r.status || "FA"}
          </Badge>
        );
      },
      search: true,
    },
  ];

  return {
    columns,
  };
}
