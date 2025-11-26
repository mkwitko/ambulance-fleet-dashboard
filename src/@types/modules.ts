import { GetModule200DataBillingType, GetModule200DataBillingType as Modules } from "@/http/generated/connectServer.schemas";

const ModulesData: Modules[] = Object.values(GetModule200DataBillingType);

export { Modules, ModulesData };


