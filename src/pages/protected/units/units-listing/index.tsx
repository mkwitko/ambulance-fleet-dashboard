import { DataTable } from "@/components/ui/data-table/data-table";
import type { GetUnits200DataItem } from "@/http/generated/connectServer.schemas";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { softEnter } from "@/components/motion/soft-enter";
import useUnitsHook from "./hooks/use-units";
import useUnitsData from "./data/use-units-data";

export default function UnitsListing() {
  const { units, handleDelete } = useUnitsHook();

  const { columns, actions } = useUnitsData({
    handleDelete,
  });

  const navigate = useNavigate();

  return (
    <motion.div {...softEnter}>
      <DataTable<GetUnits200DataItem>
        title="Unidades"
        data={units?.data || []}
        columns={columns}
        actions={actions}
        searchableKeys={columns}
        onNew={() => navigate("new")}
      />
    </motion.div>
  );
}
