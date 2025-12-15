import useGetUserPermissions from "@/hooks/use-get-user-permissions";
import { useDeleteBase } from "@/http/generated/base/base";
import type { GetIntegrations200DataItem } from "@/http/generated/connectServer.schemas";
import { useGetIntegrations } from "@/http/generated/integrations/integrations";
import { useGetAuthenticatedUser } from "@/http/generated/user/user";
import { toast } from "sonner";

export default function useIntegrationshook() {
  // Queries
  const { data: user } = useGetAuthenticatedUser();

  const { queryParams, hasSomePermission } = useGetUserPermissions();

  const { data: integrations, refetch } = useGetIntegrations(queryParams, {
    query: {
      enabled: !!user && hasSomePermission,
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

  const handleDelete = async (row: GetIntegrations200DataItem) => {
    await deleteBase({ id: row.id });
  };

  return {
    integrations,
    handleDelete,
    isPending,
    refetch,
  };
}
