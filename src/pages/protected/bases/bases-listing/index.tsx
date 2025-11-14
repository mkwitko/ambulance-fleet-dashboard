import { DataTable } from "@/components/ui/data-table/data-table";
import type { GetBases200DataItem } from "@/http/generated/connectServer.schemas";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { softEnter } from "@/components/motion/soft-enter";
import useBasesHook from "./hooks/use-bases";
import useBasesData from "./data/use-bases-data";

export default function BasesListing() {
  const { bases, handleDelete } = useBasesHook();

  const { columns, actions } = useBasesData({
    handleDelete,
  });

  const navigate = useNavigate();

  return (
    <motion.div {...softEnter}>
      <DataTable<GetBases200DataItem>
        title="Bases"
        data={bases?.data || []}
        columns={columns}
        actions={actions}
        searchableKeys={columns}
        onNew={() => navigate("new")}
      />
    </motion.div>
  );
}
