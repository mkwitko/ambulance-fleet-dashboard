import useGetUserPermissions from "@/hooks/use-get-user-permissions";
import type { GetUnits200DataItem } from "@/http/generated/connect-server.schemas";
import { useDeleteUnit, useGetUnits } from "@/http/generated/unit/unit";
import { useState } from "react";
import { toast } from "sonner";

export default function useUnitsHook() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const { queryParams, hasSomePermission } = useGetUserPermissions();

  const { data: units, refetch } = useGetUnits(
    {
      ...queryParams,
      page,
      perPage,
    },
    {
      query: {
        enabled: !!hasSomePermission,
      },
    },
  );
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
    setPage,
    setPerPage,
  };
}
