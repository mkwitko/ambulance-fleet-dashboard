import {
  GetModule200DataBillingType,
  GetModule200DataBillingType as Modules,
} from "@/http/generated/connect-server.schemas";

const ModulesData: Modules[] = Object.values(GetModule200DataBillingType);

export { Modules, ModulesData };
