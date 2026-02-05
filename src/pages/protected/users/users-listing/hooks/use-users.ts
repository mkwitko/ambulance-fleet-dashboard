import useGetUserPermissions from "@/hooks/use-get-user-permissions";
import type { GetUsers200DataItem } from "@/http/generated/connect-server.schemas";
import {
  useDeleteUser,
  useGetAuthenticatedUserAssociations,
  useGetUsers,
} from "@/http/generated/user/user";
import { useState } from "react";
import { toast } from "sonner";

export default function useUsersHook() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(2);

  const { data: userAssociations } = useGetAuthenticatedUserAssociations();
  const { queryParams, hasSomePermission } = useGetUserPermissions();

  const {
    data: users,
    refetch,
    queryKey,
  } = useGetUsers(
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

  const { mutateAsync: deleteUser, isPending } = useDeleteUser({
    mutation: {
      onSuccess: async () => {
        toast.success("Usuário excluído com sucesso.");
        await refetch();
      },
      onError: () => {
        toast.error("Erro ao excluir o usuário.");
      },
    },
  });

  const handleDelete = async (row: GetUsers200DataItem) => {
    await deleteUser({
      id: row.id,
      data: {
        companyGroupId: userAssociations?.data.companyGroup?.id as string,
      },
    });
  };

  return {
    users,
    handleDelete,
    isPending,
    queryKey,
    setPage,
    setPerPage,
  };
}
