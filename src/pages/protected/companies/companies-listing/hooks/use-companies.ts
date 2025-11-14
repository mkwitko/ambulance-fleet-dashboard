import { useDeleteCompany, useGetCompanies } from "@/http/generated/company/company";
import type { GetCompanies200DataItem } from "@/http/generated/connectServer.schemas";
import { toast } from "sonner";

export default function useCompaniesHook() {
  // Queries
  const { data: companies, refetch } = useGetCompanies();
  const { mutateAsync: deleteCompany, isPending } =
    useDeleteCompany({
      mutation: {
        onSuccess: async () => {
          toast.success("Grupo empresarial excluído com sucesso.");
          await refetch();
        },
        onError: () => {
          toast.error("Erro ao excluir o grupo empresarial.");
        },
      }
    });

  const handleDelete = (row: GetCompanies200DataItem) => {
    return deleteCompany({
      companyId: row.id,
    });
  }

  return {
    companies,
    handleDelete,
    isPending,
  };
}
