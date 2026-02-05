import useGetUserPermissions from "@/hooks/use-get-user-permissions";
import { useGetAmbulances } from "@/http/generated/ambulance/ambulance";
import { GetAmbulancesStatusItem } from "@/http/generated/connect-server.schemas";
import { useState } from "react";

export default function useRadioHook() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const { queryParams, hasSomePermission } = useGetUserPermissions();

  const { data: ambulances } = useGetAmbulances(
    {
      ...queryParams,
      page,
      perPage,
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
    },
  );

  return {
    ambulances,
    setPage,
    setPerPage,
  };
}
