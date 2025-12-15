import { DataTable } from "@/components/ui/data-table/data-table";
import type { GetUsers200DataItem } from "@/http/generated/connectServer.schemas";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { softEnter } from "@/components/motion/soft-enter";
import useUsersHook from "./hooks/use-users";
import useUsersData from "./data/use-users-data";
import { Role } from "@/@types/roles";

export default function UsersListing() {
  const { users, user, handleDelete } = useUsersHook();

  const { columns, actions } = useUsersData({
    handleDelete,
    user,
  });

  const navigate = useNavigate();

  return (
    <motion.div {...softEnter}>
      <DataTable<GetUsers200DataItem>
        title="Usuários"
        data={users?.data || []}
        columns={columns}
        actions={actions}
        searchableKeys={columns}
        onNew={() => navigate("new")}
        addingRole={Role["user:create"]}
      />
    </motion.div>
  );
}
