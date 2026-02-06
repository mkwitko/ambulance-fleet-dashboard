import { DataTable } from "@/components/ui/data-table/data-table";
import type {
  GetCommsUsers200DataItem,
  GetCommsUsers200Pagination,
} from "@/http/generated/connect-server.schemas";
import { motion } from "framer-motion";
import { softEnter } from "@/components/motion/soft-enter";
import useCommsHook from "./hooks/use-comms";
import { useNavigate } from "react-router-dom";
import useCommsData from "./data/use-comms-data";
import { Role } from "@/@types/roles";
import { useEffect } from "react";
import { AblyEvents } from "@/@types/ably-events";
import useAbly from "@/hooks/use-ably";

export default function CommsListing() {
  const { commsUsers, handleDelete, setPage, setPerPage } = useCommsHook();

  const { publish } = useAbly({});

  const { columns, actions } = useCommsData({ handleDelete, publish });
  const navigate = useNavigate();

  // Ping de atividade ao usuário do Connect Comms
  useEffect(() => {
    if (!Array.isArray(commsUsers?.data) || commsUsers.data.length === 0)
      return;

    const sendCheck = () => {
      commsUsers.data.forEach((user) => {
        publish(AblyEvents.checkingActiveness, { userId: user.id });
      });
    };

    // 1️⃣ dispara imediatamente
    sendCheck();

    // 2️⃣ dispara a cada X tempo
    const interval = setInterval(sendCheck, 30_000);

    return () => clearInterval(interval);
  }, [commsUsers?.data?.length, publish]);

  return (
    <motion.div {...softEnter}>
      <DataTable<GetCommsUsers200DataItem, GetCommsUsers200Pagination>
        title="Intercomunicação"
        data={commsUsers?.data || []}
        pagination={commsUsers?.pagination}
        columns={columns}
        actions={actions}
        searchableKeys={columns.filter((c) => c.search)}
        onNew={() => navigate("new")}
        addingRole={Role["comms:create"]}
        onPageChange={(page) => setPage(page)}
        onPerPageChange={(perPage) => {
          setPerPage(perPage);
          setPage(1);
        }}
      />
    </motion.div>
  );
}
