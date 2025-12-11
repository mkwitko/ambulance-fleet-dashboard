import type { FilteringScopeHook } from "@/hooks/use-filtering-scope-hook";
import useGetUserPermissions from "@/hooks/use-get-user-permissions";
import { useGetAmbulancesControl } from "@/http/generated/ambulance/ambulance";
import { useGetAuthenticatedUser } from "@/http/generated/user/user";

export default function useAmbulanceControlHook({
  filteringScopeHook,
}: {
  filteringScopeHook: FilteringScopeHook;
}) {
  const { data: user } = useGetAuthenticatedUser();

  const { getTopPriorityFilter, hasAppliedFilters } = filteringScopeHook;

  const { queryParams: getUserPermissionsQueryParams, hasSomePermission } =
    useGetUserPermissions();

  const queryParams = hasAppliedFilters()
    ? getTopPriorityFilter()
    : getUserPermissionsQueryParams;

  // Query
  const { data: ambulances, queryKey } = useGetAmbulancesControl(queryParams, {
    query: {
      enabled: !!user && hasSomePermission,
    },
  });

  return {
    ambulances,
    user,
    queryKey,
  };
}
