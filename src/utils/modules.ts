import type { GetUserModules200 } from "@/http/generated/connect-server.schemas";

export const hasModule = (
  itemModules: string[] | undefined,
  userModules: GetUserModules200 | undefined,
) => {
  // Se o item não exige módulo específico, mostra
  if (!itemModules || itemModules.length === 0) return true;

  if (!userModules?.data?.companies?.length) return false;

  return userModules.data.companies.some((company) =>
    company.companyModules.some((companyModule) =>
      itemModules.includes(companyModule.module.name),
    ),
  );
};

export interface ModuleAccessInfo {
  hasAccess: boolean;
  partial: boolean;
  companiesWithAccess: string[];
  companiesWithoutAccess: string[];
}

export const getModuleAccessInfo = (
  itemModules: string[] | undefined,
  userModules: GetUserModules200 | undefined,
): ModuleAccessInfo => {
  if (!itemModules || itemModules.length === 0) {
    return {
      hasAccess: true,
      partial: false,
      companiesWithAccess: [],
      companiesWithoutAccess: [],
    };
  }

  const companies = userModules?.data?.companies ?? [];

  if (companies.length === 0) {
    return {
      hasAccess: false,
      partial: false,
      companiesWithAccess: [],
      companiesWithoutAccess: [],
    };
  }

  const companiesWithAccess: string[] = [];
  const companiesWithoutAccess: string[] = [];

  companies.forEach((company) => {
    const hasModule = company.companyModules.some((companyModule) =>
      itemModules.includes(companyModule.module.name),
    );

    if (hasModule) {
      companiesWithAccess.push(company.name);
    } else {
      companiesWithoutAccess.push(company.name);
    }
  });

  return {
    hasAccess: companiesWithAccess.length > 0,
    partial:
      companiesWithAccess.length > 0 && companiesWithoutAccess.length > 0,
    companiesWithAccess,
    companiesWithoutAccess,
  };
};
