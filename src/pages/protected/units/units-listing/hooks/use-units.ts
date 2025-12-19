import useGetUserPermissions from "@/hooks/use-get-user-permissions";
import type { GetUnits200DataItem } from "@/http/generated/connectServer.schemas";
import { useDeleteUnit, useGetUnits } from "@/http/generated/unit/unit";
import { toast } from "sonner";

export default function useUnitsHook() {
  const { queryParams, hasSomePermission } = useGetUserPermissions();

  const { data: units, refetch } = useGetUnits(queryParams, {
    query: {
      enabled: !!hasSomePermission,
    },
  });
  const { mutateAsync: deleteUnit, isPending } = useDeleteUnit({
    mutation: {
      onSuccess: async () => {
        toast.success("Unidade excluída com sucesso.");
        await refetch();
      },
      onError: () => {
        toast.error("Erro ao excluir a unidade.");
      },
    },
  });

  const handleDelete = async (row: GetUnits200DataItem) => {
    await deleteUnit({ unitId: row.id });
  };

  return {
    units,
    handleDelete,
    isPending,
  };
}
