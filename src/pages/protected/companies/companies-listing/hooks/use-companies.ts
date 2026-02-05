import {
  useDeleteCompany,
  useGetCompanies,
} from "@/http/generated/company/company";
import type { GetCompanies200DataItem } from "@/http/generated/connect-server.schemas";
import { useState } from "react";
import { toast } from "sonner";

export default function useCompaniesHook() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Queries
  const { data: companies, refetch } = useGetCompanies({
    page,
    perPage,
  });
  const { mutateAsync: deleteCompany, isPending } = useDeleteCompany({
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

  const handleDelete = (row: GetCompanies200DataItem) => {
    return deleteCompany({
      companyId: row.id,
    });
  };

  return {
    companies,
    handleDelete,
    isPending,
    setPage,
    setPerPage,
  };
}
