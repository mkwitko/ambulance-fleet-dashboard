import { Role } from "@/@types/roles";
import type { FilteringScopeHook } from "@/hooks/use-filtering-scope-hook";
import { useGetAmbulancesControl } from "@/http/generated/ambulance/ambulance";
import { useGetAuthenticatedUser } from "@/http/generated/user/user";
import { hasPermission } from "@/utils/permissions";

export default function useAmbulanceControlHook({
  filteringScopeHook,
}: {
  filteringScopeHook: FilteringScopeHook;
}) {
  const { data: user } = useGetAuthenticatedUser();
  const userData = user?.data;

  const { getTopPriorityFilter, hasAppliedFilters } = filteringScopeHook;

  // Permissions
  const perms = {
    isAdmin: hasPermission(userData, Role["sys_admin:accessAll"]),
    canCompanyGroup: hasPermission(userData, Role["companyGroup:read"]),
    canCompany: hasPermission(userData, Role["company:read"]),
    canUnit: hasPermission(userData, Role["unit:read"]),
    canBase: hasPermission(userData, Role["base:read"]),
  };

  const hasSomePermission =
    perms.isAdmin ||
    perms.canCompanyGroup ||
    perms.canCompany ||
    perms.canUnit ||
    perms.canBase;

  // Helpers
  const getCompanyGroupId = () => {
    if (perms.isAdmin || perms.canCompanyGroup) {
      return userData?.companyGroup?.id;
    }
    return undefined;
  };

  const getCompaniesId = () => {
    if (!perms.isAdmin && !perms.canCompanyGroup && perms.canCompany) {
      return userData?.companies.map((c) => c.id);
    }
    return undefined;
  };

  const getUnitsId = () => {
    if (
      !perms.isAdmin &&
      !perms.canCompanyGroup &&
      !perms.canCompany &&
      perms.canUnit
    ) {
      return userData?.units.map((u) => u.id);
    }
    return undefined;
  };

  const queryParams = hasAppliedFilters()
    ? getTopPriorityFilter()
    : {
        companyGroupId: getCompanyGroupId(),
        companiesId: getCompaniesId(),
        unitsId: getUnitsId(),
      };

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
