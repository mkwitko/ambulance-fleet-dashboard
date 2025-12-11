import useGetUserPermissions from "@/hooks/use-get-user-permissions";
import {
  useDeleteAmbulance,
  useGetAmbulances,
} from "@/http/generated/ambulance/ambulance";
import type { GetAmbulances200DataItem } from "@/http/generated/connectServer.schemas";
import { useGetAuthenticatedUser } from "@/http/generated/user/user";
import { toast } from "sonner";

export default function useAmbulanceHook() {
  // Queries
  const { data: user } = useGetAuthenticatedUser();

  const { queryParams, hasSomePermission } = useGetUserPermissions();

  const {
    data: ambulances,
    refetch,
    queryKey,
  } = useGetAmbulances(queryParams, {
    query: {
      enabled: !!user && hasSomePermission,
    },
  });

  const { mutateAsync: deleteAmbulance, isPending } = useDeleteAmbulance({
    mutation: {
      onSuccess: async () => {
        toast.success("Ambulância excluída com sucesso.");
        await refetch();
      },
      onError: () => {
        toast.error("Erro ao excluir a ambulância.");
      },
    },
  });

  const handleDelete = async (row: GetAmbulances200DataItem) => {
    await deleteAmbulance({ id: row.id });
  };

  return {
    ambulances,
    user,
    handleDelete,
    isPending,
    queryKey,
  };
}
