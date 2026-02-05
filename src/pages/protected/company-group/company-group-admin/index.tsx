import { DataTable } from "@/components/ui/data-table/data-table";
import type {
  GetCompanyGroups200DataItem,
  GetCompanyGroups200Pagination,
} from "@/http/generated/connect-server.schemas";
import useCompanyGroupAdminData from "./data/use-company-group-admin-data";
import useCompanyGroupAdminHook from "./hooks/use-company-group-admin";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { softEnter } from "@/components/motion/soft-enter";
import { Role } from "@/@types/roles";

export default function CompanyGroupAdmin() {
  const { companyGroups, handleDelete, setPage, setPerPage } =
    useCompanyGroupAdminHook();

  const { columns, actions } = useCompanyGroupAdminData({
    handleDelete,
  });

  const navigate = useNavigate();

  return (
    <>
      <motion.div {...softEnter}>
        <DataTable<GetCompanyGroups200DataItem, GetCompanyGroups200Pagination>
          title="Grupos Empresariais"
          data={companyGroups?.data || []}
          pagination={companyGroups?.pagination}
          columns={columns}
          actions={actions}
          searchableKeys={[
            { key: "name", label: "Nome" },
            { key: "document", label: "Documento" },
          ]}
          onNew={() => navigate("new")}
          addingRole={Role["sys_admin:accessAll"]}
          onPageChange={(page) => setPage(page)}
          onPerPageChange={(perPage) => {
            setPerPage(perPage);
            setPage(1);
          }}
        />
      </motion.div>
    </>
  );
}
