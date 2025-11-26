import { DataTable } from "@/components/ui/data-table/data-table";
import type { GetAmbulances200DataItem } from "@/http/generated/connectServer.schemas";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { softEnter } from "@/components/motion/soft-enter";
import useUsersData from "./data/use-ambulance-data";
import useAmbulanceHook from "./hooks/use-ambulance";

export default function AmbulanceListing() {
  const { ambulances, handleDelete, queryKey } = useAmbulanceHook();

  const { columns, actions } = useUsersData({
    handleDelete,
    queryKey,
  });

  const navigate = useNavigate();

  return (
    <motion.div {...softEnter}>
      <DataTable<GetAmbulances200DataItem>
        title="Ambulâncias"
        data={ambulances?.data || []}
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
      />
    </motion.div>
  );
}
