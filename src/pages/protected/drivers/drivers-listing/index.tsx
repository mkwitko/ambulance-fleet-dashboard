import { DataTable } from "@/components/ui/data-table/data-table";
import type {
  GetDrivers200DataItem,
  GetDrivers200Pagination,
} from "@/http/generated/connect-server.schemas";
import { motion } from "framer-motion";
import { softEnter } from "@/components/motion/soft-enter";
import useDriversHook from "./hooks/use-drivers";
import useDriversData from "./data/use-drivers-data";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import useFilteringScopeHook from "@/hooks/use-filtering-scope-hook";

export default function DriversListing() {
  const filteringScopeHook = useFilteringScopeHook(true, true, false, false);

  const { drivers, handleDelete, setPage, setPerPage } = useDriversHook({
    filteringScopeHook,
  });

  const { columns, actions } = useDriversData({
    handleDelete,
  });

  const [filterActiveShift, setFilterActiveShift] = useState(false);

  return (
    <motion.div {...softEnter}>
      <DataTable<GetDrivers200DataItem, GetDrivers200Pagination>
        title="Motoristas"
        data={
          drivers?.data.filter((d) => {
            if (filterActiveShift) {
              return d.driverAssociation.length > 0;
            }
            return true;
          }) || []
        }
        pagination={drivers?.pagination as GetDrivers200Pagination}
        columns={columns}
        actions={actions}
        searchableKeys={columns}
        onPageChange={(page) => setPage(page)}
        onPerPageChange={(perPage) => {
          setPerPage(perPage);
          setPage(1);
        }}
        headerActions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setFilterActiveShift(!filterActiveShift);
              }}
            >
              {filterActiveShift
                ? "Todos Motoristas"
                : "Apenas com Turno Ativo"}
            </Button>
          </>
        }
        filteringScopeHook={filteringScopeHook}
      />
    </motion.div>
  );
}
