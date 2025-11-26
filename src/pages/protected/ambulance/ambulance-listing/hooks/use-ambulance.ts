import { Role } from "@/@types/roles";
import { useDeleteAmbulance, useGetAmbulances } from "@/http/generated/ambulance/ambulance";
import type { GetAmbulances200DataItem } from "@/http/generated/connectServer.schemas";
import { useGetAuthenticatedUser } from "@/http/generated/user/user";
import { hasPermission } from "@/utils/permissions";
import { toast } from "sonner";

export default function useAmbulanceHook() {
  // Queries
  const { data: user } = useGetAuthenticatedUser()

  // TODO - Ver como vai funcionar quando usuário tiver mais empresas
  const { data: ambulances, refetch, queryKey } = useGetAmbulances({
    companyGroupId: hasPermission(user?.data, Role["user:read"]) ? user?.data.companyGroup?.id : undefined,
  }, {
    query: {
      enabled: !!user
    }
  });

  const { mutateAsync: deleteAmbulance, isPending } =
    useDeleteAmbulance({
      mutation: {
        onSuccess: async () => {
          toast.success("Ambulância excluída com sucesso.");
          await refetch();
        },
        onError: () => {
          toast.error("Erro ao excluir a ambulância.");
        },
      }
    });

  const handleDelete = async (row: GetAmbulances200DataItem) => {
    await deleteAmbulance({ id: row.id, });
  }

  return {
    ambulances,
    user,
    handleDelete,
    isPending,
    queryKey,
  };
}
