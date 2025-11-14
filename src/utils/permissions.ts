import { GetAuthenticatedUser200DataRolesItem, type GetAuthenticatedUser200Data } from "@/http/generated/connectServer.schemas";

export function hasPermission(user: GetAuthenticatedUser200Data | undefined, permission: string): boolean {
  if(!user) return false
  if(user.roles.includes(GetAuthenticatedUser200DataRolesItem["sys_admin:accessAll"])) return true

  return user.roles.includes(permission);
}