import { DataTable } from "@/components/ui/data-table/data-table";
import type {
  GetDrivers200DataItem,
  GetDrivers200Pagination,
} from "@/http/generated/connectServer.schemas";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { softEnter } from "@/components/motion/soft-enter";
import { Role } from "@/@types/roles";
import useDriversHook from "./hooks/use-drivers";
import useDriversData from "./data/use-drivers-data";

export default function DriversListing() {
  const { drivers, handleDelete, setPage, setPerPage } = useDriversHook();

  const { columns, actions } = useDriversData({
    handleDelete,
  });

  const navigate = useNavigate();

  return (
    <motion.div {...softEnter}>
      <DataTable<GetDrivers200DataItem, GetDrivers200Pagination>
        title="Motoristas"
        data={drivers?.data || []}
        pagination={drivers?.pagination as GetDrivers200Pagination}
        columns={columns}
        actions={actions}
        searchableKeys={columns}
        onNew={() => navigate("new")}
        addingRole={Role["driver:create"]}
        onPageChange={(page) => setPage(page)}
        onPerPageChange={(perPage) => {
          setPerPage(perPage);
          setPage(1);
        }}
      />
    </motion.div>
  );
}
