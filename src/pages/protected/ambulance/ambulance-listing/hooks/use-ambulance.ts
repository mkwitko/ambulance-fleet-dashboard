import useGetUserPermissions from "@/hooks/use-get-user-permissions";
import {
  useDeleteAmbulance,
  useGetAmbulances,
} from "@/http/generated/ambulance/ambulance";
import { useGetChats } from "@/http/generated/chat/chat";
import {
  GetChatsPlatform,
  type GetAmbulances200DataItem,
} from "@/http/generated/connect-server.schemas";
import { useGetAuthenticatedUser } from "@/http/generated/user/user";
import { queryClient } from "@/lib/react-query";
import { useState } from "react";
import { toast } from "sonner";

export default function useAmbulanceHook() {
  // Queries
  const { data: user } = useGetAuthenticatedUser();

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const { queryParams, hasSomePermission } = useGetUserPermissions();

  const { queryKey: chatsQueryKey } = useGetChats(
    {
      ...queryParams,
      platform: GetChatsPlatform.WEB,
    },
    {
      query: {
        enabled: hasSomePermission,
      },
    },
  );

  const {
    data: ambulances,
    refetch,
    queryKey,
  } = useGetAmbulances(
    {
      ...queryParams,
      page,
      perPage,
    },
    {
      query: {
        enabled: !!user && hasSomePermission,
      },
    },
  );

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
    await queryClient.invalidateQueries({ queryKey: chatsQueryKey });
  };

  return {
    ambulances,
    user,
    handleDelete,
    isPending,
    queryKey,
    setPage,
    setPerPage,
  };
}
