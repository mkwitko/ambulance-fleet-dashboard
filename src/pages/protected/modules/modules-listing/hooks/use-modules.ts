import type { GetModules200DataItem } from "@/http/generated/connect-server.schemas";
import { useDeleteModule, useGetModules } from "@/http/generated/module/module";
import { useState } from "react";
import { toast } from "sonner";

export default function useModulesHook() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const { data: modules, refetch } = useGetModules({
    page,
    perPage,
  });
  const { mutateAsync: deleteModule, isPending } = useDeleteModule({
    mutation: {
      onSuccess: async () => {
        toast.success("Módulo excluído com sucesso.");
        await refetch();
      },
      onError: () => {
        toast.error("Erro ao excluir o módulo.");
      },
    },
  });

  const handleDelete = async (row: GetModules200DataItem) => {
    await deleteModule({ moduleId: row.id });
  };

  return {
    modules,
    handleDelete,
    isPending,
    setPage,
    setPerPage,
  };
}
