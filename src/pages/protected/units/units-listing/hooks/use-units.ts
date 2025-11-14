import { Role } from "@/@types/roles";
import type { GetUnits200DataItem } from "@/http/generated/connectServer.schemas";
import { useDeleteUnit, useGetUnits } from "@/http/generated/unit/unit";
import { useGetAuthenticatedUser } from "@/http/generated/user/user";
import { hasPermission } from "@/utils/permissions";
import { toast } from "sonner";

export default function useUnitsHook() {
  // Queries
  const { data: user } = useGetAuthenticatedUser()

  // TODO - Ver como vai funcionar quando usuário tiver mais empresas
  const { data: units, refetch } = useGetUnits({
    companyGroupId: hasPermission(user?.data, Role["companyGroup:read"]) ? user?.data.companyGroup?.id : undefined,
  }, {
    query: {
      enabled: !!user
    }
  });
  const { mutateAsync: deleteUnit, isPending } =
    useDeleteUnit({
      mutation: {
        onSuccess: async () => {
          toast.success("Unidade excluída com sucesso.");
          await refetch();
        },
        onError: () => {
          toast.error("Erro ao excluir a unidade.");
        },
      }
    });

  const handleDelete = async (row: GetUnits200DataItem) => {
    await deleteUnit({ unitId: row.id });
  }

  return {
    units,
    handleDelete,
    isPending,
  };
}
