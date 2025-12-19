import useGetUserPermissions from "@/hooks/use-get-user-permissions";
import {
  useDeleteCommsUser,
  useGetCommsUsers,
} from "@/http/generated/comms-user/comms-user";
import type { GetCommsUsers200DataItem } from "@/http/generated/connectServer.schemas";
import { toast } from "sonner";

export default function useCommsHook() {
  const { queryParams, hasSomePermission } = useGetUserPermissions();

  const { data: commsUsers, refetch } = useGetCommsUsers(queryParams, {
    query: {
      enabled: hasSomePermission,
    },
  });

  const { mutateAsync: deleteCommsUser, isPending } = useDeleteCommsUser({
    mutation: {
      onSuccess: async () => {
        toast.success("Usuário excluído com sucesso.");
        await refetch();
      },
      onError: () => {
        toast.error("Erro ao excluir a base.");
      },
    },
  });

  const handleDelete = async (row: GetCommsUsers200DataItem) => {
    await deleteCommsUser({ id: row.id });
  };

  return {
    commsUsers,
    handleDelete,
    isPending,
  };
}
