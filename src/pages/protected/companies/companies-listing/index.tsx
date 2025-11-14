import { DataTable } from "@/components/ui/data-table/data-table";
import type { GetCompanies200DataItem } from "@/http/generated/connectServer.schemas";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { softEnter } from "@/components/motion/soft-enter";
import useCompaniesHook from "./hooks/use-companies";
import useCompaniesData from "./data/use-companies-data";

export default function CompaniesListing() {
  const {
    companies,
    openDeleteDialog,
    setOpenDeleteDialog,
    selectedRow,
    handleOpenDeleteDialog,
    handleConfirmDelete,
    isPending,
  } = useCompaniesHook();

  const { columns, actions } = useCompaniesData({
    handleOpenDeleteDialog,
  });

  const navigate = useNavigate();

  return (
    <>
      <motion.div {...softEnter}>
        <DataTable<GetCompanies200DataItem>
          title="Empresas"
          data={companies?.data || []}
          columns={columns}
          actions={actions}
          searchableKeys={[
            { key: "name", label: "Nome" },
            { key: "document", label: "Documento" },
          ]}
          onNew={() => navigate("new")}
        />
      </motion.div>

      <DeleteDialog
        open={openDeleteDialog}
        setOpen={setOpenDeleteDialog}
        itemName={selectedRow?.name}
        onConfirm={handleConfirmDelete}
        isLoading={isPending}
      />
    </>
  );
}
