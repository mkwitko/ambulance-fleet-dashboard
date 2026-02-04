import { DataTable } from "@/components/ui/data-table/data-table";
import type { GetUsers200DataItem } from "@/http/generated/connectServer.schemas";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { softEnter } from "@/components/motion/soft-enter";
import useUsersHook from "./hooks/use-users";
import useUsersData from "./data/use-users-data";
import { Role } from "@/@types/roles";

export default function UsersListing() {
  const { users, handleDelete, setPage, setPerPage } = useUsersHook();

  const { columns, actions } = useUsersData({
    handleDelete,
  });

  const navigate = useNavigate();

  return (
    <motion.div {...softEnter}>
      <DataTable<GetUsers200DataItem>
        title="Usuários"
        data={users?.data || []}
        pagination={users?.pagination}
        columns={columns}
        actions={actions}
        searchableKeys={columns}
        onNew={() => navigate("new")}
        addingRole={Role["user:create"]}
        onPageChange={(page) => setPage(page)}
        onPerPageChange={(perPage) => {
          setPerPage(perPage);
          setPage(1);
        }}
      />
    </motion.div>
  );
}
