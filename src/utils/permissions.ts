import {
  GetAuthenticatedUserRoles200DataRolesItem as Role,
  type GetAuthenticatedUserRoles200Data,
} from "@/http/generated/connectServer.schemas";

export function hasPermission(
  user: GetAuthenticatedUserRoles200Data | undefined,
  permission: Role,
  onlySuperAdmin = false
): boolean {
  if (!user?.roles?.length) return false;

  const roles = user.roles;

  const isCompanyAdmin = roles.includes(Role["companyGroup_admin:accessAll"]);
  const isSysAdmin = roles.includes(Role["sys_admin:accessAll"]);

  if (onlySuperAdmin) {
    return isSysAdmin;
  }

  if (isSysAdmin || isCompanyAdmin) {
    return true;
  }

  return roles.includes(permission);
}
