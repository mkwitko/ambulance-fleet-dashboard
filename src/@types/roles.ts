import {
  CreateUserBodyRolesItem,
  GetAuthenticatedUserPermissions200DataRolesItem as Role,
} from "@/http/generated/connect-server.schemas";

const RolesData: Role[] = Object.values(CreateUserBodyRolesItem);

export { Role, RolesData };
