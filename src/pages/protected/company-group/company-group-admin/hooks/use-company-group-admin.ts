import {
  useGetCompanyGroups,
  useDeleteCompanyGroup,
} from "@/http/generated/company-group/company-group";
import type { GetCompanyGroups200DataItem } from "@/http/generated/connectServer.schemas";
import { toast } from "sonner";

export default function useCompanyGroupAdminHook() {

  // Queries
  const { data: companyGroups, refetch } = useGetCompanyGroups();
  const { mutateAsync: deleteCompanyGroup, isPending } =
    useDeleteCompanyGroup({
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

  const handleDelete = async (row: GetCompanyGroups200DataItem) => {
    await deleteCompanyGroup({ companyGroupId: row.id });
  }


  return {
    companyGroups,
    isPending,
    handleDelete
  };
}
