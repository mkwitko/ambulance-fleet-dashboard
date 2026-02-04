// AmbulanceControlBlock.tsx
import { DataTable } from "@/components/ui/data-table/data-table";
import type {
  GetAmbulancesControl200DataItem,
  GetAmbulancesControl200Pagination,
} from "@/http/generated/connectServer.schemas";
import AmbulanceStatusChart from "./ambulance-charts";

interface Props {
  ambulances: GetAmbulancesControl200DataItem[];
  pagination: GetAmbulancesControl200Pagination;
  columns: any[];
  filteringScopeHook: any;
  autoPaginate?: boolean;
  autoPaginateInterval?: number;
  height?: string;
  headerActions?: React.ReactNode;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
}

export function AmbulanceControlRender({
  ambulances,
  pagination,
  columns,
  filteringScopeHook,
  autoPaginate = true,
  autoPaginateInterval = 5000,
  height = "500px",
  headerActions,
  setPage,
  setPerPage,
}: Props) {
  return (
    <div className="space-y-4">
      <AmbulanceStatusChart ambulances={ambulances} />
      <DataTable<
        GetAmbulancesControl200DataItem,
        GetAmbulancesControl200Pagination
      >
        title="Controle de VTRs"
        data={ambulances}
        pagination={pagination}
        columns={columns}
        searchableKeys={columns.filter((c) => c.search)}
        height={height}
        filteringScopeHook={filteringScopeHook}
        autoPaginate={autoPaginate}
        autoPaginateInterval={autoPaginateInterval}
        headerActions={headerActions}
        onPageChange={(page) => setPage(page)}
        onPerPageChange={(perPage) => {
          setPerPage(perPage);
          setPage(1);
        }}
      />
    </div>
  );
}
