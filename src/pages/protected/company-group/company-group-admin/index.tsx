import { DataTable } from "@/components/ui/data-table/data-table";
import type { GetCompanyGroups200DataItem } from "@/http/generated/connectServer.schemas";
import useCompanyGroupAdminData from "./data/use-company-group-admin-data";
import useCompanyGroupAdminHook from "./hooks/use-company-group-admin";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { softEnter } from "@/components/motion/soft-enter";

export default function CompanyGroupAdmin() {
  const { companyGroups, handleDelete } = useCompanyGroupAdminHook();

  const { columns, actions } = useCompanyGroupAdminData({
    handleDelete,
  });

  const navigate = useNavigate();

  return (
    <>
      <motion.div {...softEnter}>
        <DataTable<GetCompanyGroups200DataItem>
          title="Grupos Empresariais"
          data={companyGroups?.data || []}
          columns={columns}
          actions={actions}
          searchableKeys={[
            { key: "name", label: "Nome" },
            { key: "document", label: "Documento" },
          ]}
          onNew={() => navigate("new")}
        />
      </motion.div>
    </>
  );
}
