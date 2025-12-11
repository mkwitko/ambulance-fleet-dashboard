import { Role } from "@/@types/roles";
import { useGetAmbulances } from "@/http/generated/ambulance/ambulance";
import { GetAmbulancesStatusItem } from "@/http/generated/connectServer.schemas";
import { useGetAuthenticatedUser } from "@/http/generated/user/user";
import { hasPermission } from "@/utils/permissions";

export default function useRadioHook() {
  // Queries
  const { data: user } = useGetAuthenticatedUser();

  const isAdmin = hasPermission(user?.data, Role["sys_admin:accessAll"]);
  const hasCompanyGroupPermission = hasPermission(
    user?.data,
    Role["companyGroup:read"]
  );
  const hasCompanyPermission = hasPermission(user?.data, Role["company:read"]);
  const hasUnitPermissions = hasPermission(user?.data, Role["unit:read"]);

  const hasSomePermission =
    isAdmin ||
    hasCompanyGroupPermission ||
    hasCompanyPermission ||
    hasUnitPermissions;

  const { data: ambulances } = useGetAmbulances(
    {
      companyGroupId: isAdmin
        ? user?.data.companyGroup?.id
        : hasCompanyGroupPermission
        ? user?.data.companyGroup?.id
        : undefined,
      companiesId:
        isAdmin || hasCompanyGroupPermission
          ? undefined
          : hasCompanyPermission
          ? user?.data.companies.map((company) => company.id)
          : undefined,
      unitsId:
        isAdmin || hasCompanyGroupPermission || hasCompanyPermission
          ? undefined
          : hasUnitPermissions
          ? user?.data.units.map((unit) => unit.id)
          : undefined,
      status: [
        GetAmbulancesStatusItem.QAP,
        GetAmbulancesStatusItem.OCP,
        GetAmbulancesStatusItem.J5,
        GetAmbulancesStatusItem.J4,
        GetAmbulancesStatusItem.EVT,
      ],
    },
    {
      query: {
        enabled: !!user && hasSomePermission,
      },
    }
  );

  return {
    ambulances,
    user,
  };
}
