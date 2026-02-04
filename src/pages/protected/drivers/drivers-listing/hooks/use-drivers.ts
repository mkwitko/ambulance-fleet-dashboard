import type { FilteringScopeHook } from "@/hooks/use-filtering-scope-hook";
import useGetUserPermissions from "@/hooks/use-get-user-permissions";
import type { GetDrivers200DataItem } from "@/http/generated/connectServer.schemas";
import {
  useDeleteDriver,
  useGetDrivers,
} from "@/http/generated/drivers/drivers";
import { useGetAuthenticatedUserAssociations } from "@/http/generated/user/user";
import { useState } from "react";
import { toast } from "sonner";

export default function useDriversHook({
  filteringScopeHook,
}: {
  filteringScopeHook?: FilteringScopeHook;
} = {}) {
  const { data: userAssociations } = useGetAuthenticatedUserAssociations();
  const { queryParams: getDriversPermissionsQueryParams, hasSomePermission } =
    useGetUserPermissions();

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const queryParams = filteringScopeHook?.hasAppliedFilters()
    ? filteringScopeHook.getTopPriorityFilter()
    : getDriversPermissionsQueryParams;

  const {
    data: drivers,
    refetch,
    queryKey,
  } = useGetDrivers(
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

  const { mutateAsync: deleteDriver, isPending } = useDeleteDriver({
    mutation: {
      onSuccess: async () => {
        toast.success("Motorista excluído com sucesso.");
        await refetch();
      },
      onError: () => {
        toast.error("Erro ao excluir o motorista.");
      },
    },
  });

  const handleDelete = async (row: GetDrivers200DataItem) => {
    await deleteDriver({
      id: row.id,
      data: {
        companyGroupId: userAssociations?.data.companyGroup?.id as string,
      },
    });
  };

  return {
    drivers,
    handleDelete,
    isPending,
    queryKey,
    refetch,
    setPage,
    setPerPage,
  };
}
