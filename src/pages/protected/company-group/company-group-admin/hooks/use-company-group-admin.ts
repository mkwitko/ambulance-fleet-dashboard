import {
  useGetCompanyGroups,
  useDeleteCompanyGroup,
} from "@/http/generated/company-group/company-group";
import type { GetCompanyGroups200DataItem } from "@/http/generated/connect-server.schemas";
import { useState } from "react";
import { toast } from "sonner";

export default function useCompanyGroupAdminHook() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Queries
  const { data: companyGroups, refetch } = useGetCompanyGroups({
    page,
    perPage,
  });
  const { mutateAsync: deleteCompanyGroup, isPending } = useDeleteCompanyGroup({
    mutation: {
      onSuccess: async () => {
        toast.success("Grupo empresarial excluído com sucesso.");
        await refetch();
      },
      onError: () => {
        toast.error("Erro ao excluir o grupo empresarial.");
      },
    },
  });

  const handleDelete = async (row: GetCompanyGroups200DataItem) => {
    await deleteCompanyGroup({ companyGroupId: row.id });
  };

  return {
    companyGroups,
    isPending,
    handleDelete,
    setPage,
    setPerPage,
  };
}
