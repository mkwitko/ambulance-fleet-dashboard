import { DataTable } from "@/components/ui/data-table/data-table";
import type { GetIntegrations200DataItem } from "@/http/generated/connectServer.schemas";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { softEnter } from "@/components/motion/soft-enter";
import useIntegrationshook from "./hooks/use-integrations";
import useIntegrationsData from "./data/use-integrations-data";

export default function IntegrationsListing() {
  const { integrations, handleDelete } = useIntegrationshook();

  const { columns, actions } = useIntegrationsData({
    handleDelete,
  });

  const navigate = useNavigate();

  return (
    <motion.div {...softEnter}>
      <DataTable<GetIntegrations200DataItem>
        title="Integrações"
        data={integrations?.data || []}
        columns={columns}
        actions={actions}
        searchableKeys={columns}
        onNew={() => navigate("new")}
      />
    </motion.div>
  );
}
