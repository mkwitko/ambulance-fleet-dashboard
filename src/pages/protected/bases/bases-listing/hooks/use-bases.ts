import { Role } from "@/@types/roles";
import { useDeleteBase, useGetBases } from "@/http/generated/base/base";
import type { GetBases200DataItem } from "@/http/generated/connectServer.schemas";
import { useGetAuthenticatedUser } from "@/http/generated/user/user";
import { hasPermission } from "@/utils/permissions";
import { toast } from "sonner";

export default function useBasesHook() {
  // Queries
  const { data: user } = useGetAuthenticatedUser()

  // TODO - Ver como vai funcionar quando usuário tiver mais empresas
  const { data: bases, refetch } = useGetBases({
    companyGroupId: hasPermission(user?.data, Role["companyGroup:read"]) ? user?.data.companyGroup?.id : undefined,
  }, {
    query: {
      enabled: !!user
    }
  });
  const { mutateAsync: deleteBase, isPending } =
    useDeleteBase({
      mutation: {
        onSuccess: async () => {
          toast.success("Base excluída com sucesso.");
          await refetch();
        },
        onError: () => {
          toast.error("Erro ao excluir a base.");
        },
      }
    });

  const handleDelete = async (row: GetBases200DataItem) => {
    await deleteBase({ id: row.id });
  }

  return {
    bases,
    handleDelete,
    isPending,
  };
}
