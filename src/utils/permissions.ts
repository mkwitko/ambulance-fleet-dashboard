import {
  GetAuthenticatedUserRoles200DataRolesItem as Role,
  type GetAuthenticatedUserRoles200Data,
} from "@/http/generated/connect-server.schemas";

export function hasPermission(
  user: GetAuthenticatedUserRoles200Data | undefined,
  permission: Role | Role[],
  onlySuperAdmin = false,
): boolean {
  if (!user?.roles?.length) return false;

  const roles = user.roles;
  const requiredRoles = Array.isArray(permission) ? permission : [permission];

  const isCompanyGroupAdmin = roles.includes(
    Role["companyGroup_admin:accessAll"],
  );
  const isSysAdmin = roles.includes(Role["sys_admin:accessAll"]);
  const isCompanyAdmin = roles.includes(Role["company_admin:accessAll"]);

  if (onlySuperAdmin) {
    return isSysAdmin;
  }

  if (isSysAdmin || isCompanyGroupAdmin || isCompanyAdmin) {
    return true;
  }

  return requiredRoles.some((role) => roles.includes(role));
}
