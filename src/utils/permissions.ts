import {
  GetAuthenticatedUserRoles200DataRolesItem,
  type GetAuthenticatedUserRoles200Data,
} from "@/http/generated/connectServer.schemas";

export function hasPermission(
  user: GetAuthenticatedUserRoles200Data | undefined,
  permission: string
): boolean {
  if (!user) return false;
  if (
    user.roles.includes(
      GetAuthenticatedUserRoles200DataRolesItem["sys_admin:accessAll"]
    )
  )
    return true;

  return user.roles.includes(
    permission as GetAuthenticatedUserRoles200DataRolesItem
  );
}
