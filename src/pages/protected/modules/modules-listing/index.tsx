import { DataTable } from "@/components/ui/data-table/data-table";
import type {
  GetModules200DataItem,
  GetModules200Pagination,
} from "@/http/generated/connectServer.schemas";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { softEnter } from "@/components/motion/soft-enter";
import useModulesHook from "./hooks/use-modules";
import useModulesData from "./data/use-bases-data";
import { Role } from "@/@types/roles";

export default function ModulesListing() {
  const { modules, handleDelete, setPage, setPerPage } = useModulesHook();

  const { columns, actions } = useModulesData({
    handleDelete,
  });

  const navigate = useNavigate();

  return (
    <motion.div {...softEnter}>
      <DataTable<GetModules200DataItem, GetModules200Pagination>
        title="Módulos"
        data={modules?.data || []}
        pagination={modules?.pagination}
        columns={columns}
        actions={actions}
        searchableKeys={columns}
        onNew={() => navigate("new")}
        addingRole={Role["sys_admin:accessAll"]}
        onPageChange={(page) => setPage(page)}
        onPerPageChange={(perPage) => {
          setPerPage(perPage);
          setPage(1);
        }}
      />
    </motion.div>
  );
}
