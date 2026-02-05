import useGetUserPermissions from "@/hooks/use-get-user-permissions";
import type { GetIntegrations200DataItem } from "@/http/generated/connect-server.schemas";
import {
  useDeleteIntegrationsId,
  useGetIntegrations,
} from "@/http/generated/integrations/integrations";
import { toast } from "sonner";

export default function useIntegrationshook() {
  const { queryParams, hasSomePermission } = useGetUserPermissions();

  const { data: integrations, refetch } = useGetIntegrations(queryParams, {
    query: {
      enabled: hasSomePermission,
    },
  });
  const { mutateAsync: deleteIntegration, isPending } = useDeleteIntegrationsId(
    {
      mutation: {
        onSuccess: async () => {
          toast.success("Integração excluída com sucesso.");
          await refetch();
        },
        onError: () => {
          toast.error("Erro ao excluir a integração.");
        },
      },
    },
  );

  const handleDelete = async (row: GetIntegrations200DataItem) => {
    await deleteIntegration({ id: row.id });
  };

  return {
    integrations,
    handleDelete,
    isPending,
    refetch,
  };
}
