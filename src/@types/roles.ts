
import { CreateUserBodyRolesItem, GetAuthenticatedUser200DataRolesItem as Role } from "@/http/generated/connectServer.schemas";

const RolesData: Role[] = Object.values(CreateUserBodyRolesItem);

export { Role, RolesData };