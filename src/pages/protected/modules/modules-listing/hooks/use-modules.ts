import type { GetModules200DataItem } from "@/http/generated/connectServer.schemas";
import { useDeleteModule, useGetModules } from "@/http/generated/module/module";
import { toast } from "sonner";

export default function useModulesHook() {
  const { data: modules, refetch } = useGetModules(
    {},
  );
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
  };
}
