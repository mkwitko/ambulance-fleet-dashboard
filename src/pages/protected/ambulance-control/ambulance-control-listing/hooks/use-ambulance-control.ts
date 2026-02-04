import type { FilteringScopeHook } from "@/hooks/use-filtering-scope-hook";
import useGetUserPermissions from "@/hooks/use-get-user-permissions";
import { useGetAmbulancesControl } from "@/http/generated/ambulance/ambulance";
import { useGetAuthenticatedUser } from "@/http/generated/user/user";
import { useMemo, useState } from "react";
import { GetAmbulancesControl200DataItemStatus } from "@/http/generated/connectServer.schemas";

export default function useAmbulanceControlHook({
  filteringScopeHook,
}: {
  filteringScopeHook: FilteringScopeHook;
}) {
  const { data: user } = useGetAuthenticatedUser();

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const { getTopPriorityFilter, hasAppliedFilters } = filteringScopeHook;

  const { queryParams: getUserPermissionsQueryParams, hasSomePermission } =
    useGetUserPermissions();

  const queryParams = hasAppliedFilters()
    ? getTopPriorityFilter()
    : getUserPermissionsQueryParams;

  // Query
  const { data: ambulances, queryKey } = useGetAmbulancesControl(
    { ...queryParams, page, perPage },
    {
      query: {
        enabled: !!user && hasSomePermission,
      },
    },
  );

  // Filtra as ambulâncias para excluir FA (Fora de ação) e MN (Manutenção)
  const filteredAmbulances = useMemo(() => {
    if (!ambulances?.data) return ambulances;

    const filtered = ambulances.data.filter(
      (ambulance) =>
        ambulance.status !== GetAmbulancesControl200DataItemStatus.FA &&
        ambulance.status !== GetAmbulancesControl200DataItemStatus.MN,
    );

    return {
      ...ambulances,
      data: filtered,
    };
  }, [ambulances]);

  return {
    ambulances: filteredAmbulances,
    user,
    queryKey,
    setPage,
    setPerPage,
  };
}
