import useGetUserPermissions from "@/hooks/use-get-user-permissions";
import { GetAmbulancesStatusItem } from "@/http/generated/connect-server.schemas";
import { useGetRadioAmbulances } from "@/http/generated/radio/radio";
import { useState } from "react";

export default function useRadioHook() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const { queryParams, hasSomePermission } = useGetUserPermissions();

  const { data: ambulances } = useGetRadioAmbulances(
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
