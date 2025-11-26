import { DataTable } from "@/components/ui/data-table/data-table";
import type { GetModules200DataItem } from "@/http/generated/connectServer.schemas";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { softEnter } from "@/components/motion/soft-enter";
import useModulesHook from "./hooks/use-modules";
import useModulesData from "./data/use-bases-data";

export default function ModulesListing() {
  const { modules, handleDelete } = useModulesHook();

  const { columns, actions } = useModulesData({
    handleDelete,
  });

  const navigate = useNavigate();

  return (
    <motion.div {...softEnter}>
      <DataTable<GetModules200DataItem>
        title="Módulos"
        data={modules?.data || []}
        columns={columns}
        actions={actions}
        searchableKeys={columns}
        onNew={() => navigate("new")}
      />
    </motion.div>
  );
}
