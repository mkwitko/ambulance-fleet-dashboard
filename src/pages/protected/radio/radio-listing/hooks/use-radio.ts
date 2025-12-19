import useGetUserPermissions from "@/hooks/use-get-user-permissions";
import { useGetAmbulances } from "@/http/generated/ambulance/ambulance";
import { GetAmbulancesStatusItem } from "@/http/generated/connectServer.schemas";

export default function useRadioHook() {
  const { queryParams, hasSomePermission } = useGetUserPermissions();

  const { data: ambulances } = useGetAmbulances(
    {
      ...queryParams,
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
        enabled: hasSomePermission,
      },
    }
  );

  return {
    ambulances,
  };
}
