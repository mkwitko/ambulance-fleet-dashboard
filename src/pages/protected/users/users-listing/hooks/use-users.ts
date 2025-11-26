import { Role } from "@/@types/roles";
import type { GetUsers200DataItem } from "@/http/generated/connectServer.schemas";
import { useDeleteUser, useGetAuthenticatedUser, useGetUsers } from "@/http/generated/user/user";
import { hasPermission } from "@/utils/permissions";
import { toast } from "sonner";

export default function useUsersHook() {
  // Queries
  const { data: user } = useGetAuthenticatedUser()

  // TODO - Ver como vai funcionar quando usuário tiver mais empresas
  const { data: users, refetch } = useGetUsers({
    companyGroupId: hasPermission(user?.data, Role["user:read"]) ? user?.data.companyGroup?.id : undefined,
  }, {
    query: {
      enabled: !!user
    }
  });

  const { mutateAsync: deleteUser, isPending } =
    useDeleteUser({
      mutation: {
        onSuccess: async () => {
          toast.success("Usuário excluído com sucesso.");
          await refetch();
        },
        onError: () => {
          toast.error("Erro ao excluir o usuário.");
        },
      }
    });

  const handleDelete = async (row: GetUsers200DataItem) => {
    await deleteUser({ id: row.id, data: {
      companyGroupId: user?.data.companyGroup?.id as string,
    } });
  }

  return {
    users,
    user,
    handleDelete,
    isPending,
  };
}
