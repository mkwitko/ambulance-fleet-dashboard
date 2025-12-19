import useGetUserPermissions from "@/hooks/use-get-user-permissions";
import { useDeleteBase, useGetBases } from "@/http/generated/base/base";
import type { GetBases200DataItem } from "@/http/generated/connectServer.schemas";
import { toast } from "sonner";

export default function useBasesHook() {
  const { queryParams, hasSomePermission } = useGetUserPermissions();

  const { data: bases, refetch } = useGetBases(queryParams, {
    query: {
      enabled: hasSomePermission,
    },
  });
  const { mutateAsync: deleteBase, isPending } = useDeleteBase({
    mutation: {
      onSuccess: async () => {
        toast.success("Base excluída com sucesso.");
        await refetch();
      },
      onError: () => {
        toast.error("Erro ao excluir a base.");
      },
    },
  });

  const handleDelete = async (row: GetBases200DataItem) => {
    await deleteBase({ id: row.id });
  };

  return {
    bases,
    handleDelete,
    isPending,
  };
}
