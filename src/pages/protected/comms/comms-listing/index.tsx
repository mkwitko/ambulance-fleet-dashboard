import { DataTable } from "@/components/ui/data-table/data-table";
import type { GetCommsUsers200DataItem } from "@/http/generated/connectServer.schemas";
import { motion } from "framer-motion";
import { softEnter } from "@/components/motion/soft-enter";
import useCommsHook from "./hooks/use-comms";
import { useNavigate } from "react-router-dom";
import useCommsData from "./data/use-comms-data";

export default function CommsListing() {
  const { commsUsers, handleDelete } = useCommsHook();

  const { columns, actions } = useCommsData({ handleDelete });
  const navigate = useNavigate();

  return (
    <motion.div {...softEnter}>
      <DataTable<GetCommsUsers200DataItem>
        title="Intercomunicação"
        data={commsUsers?.data || []}
        columns={columns}
        actions={actions}
        searchableKeys={columns.filter((c) => c.search)}
        onNew={() => navigate("new")}
      />
    </motion.div>
  );
}
