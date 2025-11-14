import { useDeleteCompany, useGetCompanies } from "@/http/generated/company/company";
import type { GetCompanies200DataItem } from "@/http/generated/connectServer.schemas";
import { useState } from "react";
import { toast } from "sonner";

export default function useCompaniesHook() {
  // States
  const [selectedRow, setSelectedRow] =
    useState<GetCompanies200DataItem | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Queries
  const { data: companies, refetch } = useGetCompanies();
  const { mutateAsync: deleteCompany, isPending } =
    useDeleteCompany();

  // Handlers
  const handleOpenDeleteDialog = (row: GetCompanies200DataItem) => {
    setSelectedRow(row);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRow) return;

    try {
      await deleteCompany({ companyId: selectedRow.id });
      toast.success("Empresa excluída com sucesso.");
      setOpenDeleteDialog(false);
      refetch?.();
    } catch (err) {
      toast.error(
        "Ocorreu um erro ao excluir a empresa. Tente novamente."
      );
    }
  };

  return {
    companies,
    openDeleteDialog,
    setOpenDeleteDialog,
    selectedRow,
    handleOpenDeleteDialog,
    handleConfirmDelete,
    isPending,
  };
}
