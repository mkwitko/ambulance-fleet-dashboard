import { DataTable } from "@/components/ui/data-table/data-table";
import type {
  GetAmbulances200DataItem,
  GetAmbulances200Pagination,
} from "@/http/generated/connect-server.schemas";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { softEnter } from "@/components/motion/soft-enter";
import useUsersData from "./data/use-ambulance-data";
import useAmbulanceHook from "./hooks/use-ambulance";
import { Role } from "@/@types/roles";

export default function AmbulanceListing() {
  const { ambulances, handleDelete, queryKey, setPage, setPerPage } =
    useAmbulanceHook();

  const { columns, actions } = useUsersData({
    handleDelete,
    queryKey,
  });

  const navigate = useNavigate();

  return (
    <motion.div {...softEnter}>
      <DataTable<GetAmbulances200DataItem, GetAmbulances200Pagination>
        title="Ambulâncias"
        data={ambulances?.data || []}
        pagination={ambulances?.pagination}
        columns={columns}
        actions={actions}
        searchableKeys={[
          { key: "name", label: "Nome" },
          {
            key: "licensePlate",
            label: "Placa",
          },
        ]}
        onNew={() => navigate("new")}
        addingRole={Role["ambulance:create"]}
        onPageChange={(page) => setPage(page)}
        onPerPageChange={(perPage) => {
          setPerPage(perPage);
          setPage(1);
        }}
      />
    </motion.div>
  );
}
