import { DataTable } from "@/components/ui/data-table/data-table";
import type {
  GetBases200DataItem,
  GetBases200Pagination,
} from "@/http/generated/connect-server.schemas";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { softEnter } from "@/components/motion/soft-enter";
import useBasesHook from "./hooks/use-bases";
import useBasesData from "./data/use-bases-data";
import { Role } from "@/@types/roles";

export default function BasesListing() {
  const { bases, handleDelete, setPage, setPerPage } = useBasesHook();

  const { columns, actions } = useBasesData({
    handleDelete,
  });

  const navigate = useNavigate();

  return (
    <motion.div {...softEnter}>
      <DataTable<GetBases200DataItem, GetBases200Pagination>
        title="Bases"
        data={bases?.data || []}
        pagination={bases?.pagination}
        columns={columns}
        actions={actions}
        searchableKeys={columns}
        onNew={() => navigate("new")}
        addingRole={Role["base:create"]}
        onPageChange={(page) => setPage(page)}
        onPerPageChange={(perPage) => {
          setPerPage(perPage);
          setPage(1);
        }}
      />
    </motion.div>
  );
}
