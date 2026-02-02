import { Role } from "@/@types/roles";
import {
  useGetAuthenticatedUserAssociations,
  useGetAuthenticatedUserPermissions,
} from "@/http/generated/user/user";
import { hasPermission } from "@/utils/permissions";

export default function useGetUserPermissions() {
  const { data: userAssociations, isLoading: isLoadingAssociations } =
    useGetAuthenticatedUserAssociations();
  const { data: userPermissions, isLoading: isLoadingPermissions } =
    useGetAuthenticatedUserPermissions();
  const userData = userPermissions?.data;

  const isReady = !isLoadingAssociations && !isLoadingPermissions;

  const perms = {
    isAdmin: hasPermission(userData, Role["sys_admin:accessAll"]),
    canCompanyGroup: hasPermission(userData, Role["companyGroup:read"]),
    canCompany: hasPermission(userData, Role["company:read"]),
    canUnit: hasPermission(userData, Role["unit:read"]),
    canBase: hasPermission(userData, Role["base:read"]),
  };

  const hasSomePermission =
    isReady &&
    (perms.isAdmin ||
      perms.canCompanyGroup ||
      perms.canCompany ||
      perms.canUnit ||
      perms.canBase);

  // Helpers
  const getCompanyGroupId = () => {
    if (perms.isAdmin || perms.canCompanyGroup) {
      return userAssociations?.data?.companyGroup?.id;
    }
    return undefined;
  };

  const getCompaniesId = () => {
    if (!perms.isAdmin && !perms.canCompanyGroup && perms.canCompany) {
      return userAssociations?.data?.companies.map((c) => c.id);
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
      return userAssociations?.data?.units.map((u) => u.id);
    }
    return undefined;
  };

  return {
    queryParams: {
      companyGroupId: getCompanyGroupId(),
      companiesId: getCompaniesId(),
      unitsId: getUnitsId(),
    },
    hasSomePermission,
    userPermissions,
  };
}
