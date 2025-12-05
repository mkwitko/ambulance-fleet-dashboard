// AmbulanceControlBlock.tsx
import { DataTable } from "@/components/ui/data-table/data-table";
import type { GetAmbulancesControl200DataItem } from "@/http/generated/connectServer.schemas";
import AmbulanceStatusChart from "./ambulance-charts";

interface Props {
  ambulances: GetAmbulancesControl200DataItem[];
  columns: any[];
  filteringScopeHook: any;
  autoPaginate?: boolean;
  autoPaginateInterval?: number;
  height?: string;
  headerActions?: React.ReactNode;
}

export function AmbulanceControlRender({
  ambulances,
  columns,
  filteringScopeHook,
  autoPaginate = true,
  autoPaginateInterval = 5000,
  height = "500px",
  headerActions,
}: Props) {
  return (
    <div className="space-y-4">
      <AmbulanceStatusChart ambulances={ambulances} />
      <DataTable
        title="Controle de VTRs"
        data={ambulances}
        columns={columns}
        searchableKeys={columns.filter((c) => c.search)}
        height={height}
        filteringScopeHook={filteringScopeHook}
        autoPaginate={autoPaginate}
        autoPaginateInterval={autoPaginateInterval}
        headerActions={headerActions}
      />
    </div>
  );
}
