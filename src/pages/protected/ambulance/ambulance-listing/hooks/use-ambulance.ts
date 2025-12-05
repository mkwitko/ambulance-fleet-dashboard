import { Role } from "@/@types/roles";
import {
  useDeleteAmbulance,
  useGetAmbulances,
} from "@/http/generated/ambulance/ambulance";
import type { GetAmbulances200DataItem } from "@/http/generated/connectServer.schemas";
import { useGetAuthenticatedUser } from "@/http/generated/user/user";
import { hasPermission } from "@/utils/permissions";
import { toast } from "sonner";

export default function useAmbulanceHook() {
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

  const {
    data: ambulances,
    refetch,
    queryKey,
  } = useGetAmbulances(
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
    },
    {
      query: {
        enabled: !!user && hasSomePermission,
      },
    }
  );

  const { mutateAsync: deleteAmbulance, isPending } = useDeleteAmbulance({
    mutation: {
      onSuccess: async () => {
        toast.success("Ambulância excluída com sucesso.");
        await refetch();
      },
      onError: () => {
        toast.error("Erro ao excluir a ambulância.");
      },
    },
  });

  const handleDelete = async (row: GetAmbulances200DataItem) => {
    await deleteAmbulance({ id: row.id });
  };

  return {
    ambulances,
    user,
    handleDelete,
    isPending,
    queryKey,
  };
}
