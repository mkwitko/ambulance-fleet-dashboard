import type { GetDrivers200 } from "@/http/generated/connect-server.schemas";
import { getGetDriversQueryKey } from "@/http/generated/drivers/drivers";
import { queryClient } from "@/lib/react-query";
import type { InboundMessage } from "ably";

export const updateDriverAssociation = ({
  incomingMessage,
}: {
  incomingMessage: InboundMessage;
}) => {
  queryClient.setQueriesData<GetDrivers200>(
    {
      predicate: (query) => query.queryKey[0] === getGetDriversQueryKey()[0],
    },
    (oldData) => {
      if (!oldData) return oldData;
      const updatedData = oldData.data.map((driver) => {
        if (driver.logFrotaId === incomingMessage.data.driverId) {
          return {
            ...driver,
            driverAssociation: [
              {
                ...driver.driverAssociation[0],
                idTurno: incomingMessage.data.idTurno || null,
                ambulance: {
                  ...driver.driverAssociation[0]?.ambulance,
                  id: incomingMessage.data.ambulanceId || null,
                  name: incomingMessage.data.ambulanceName || null,
                },
              },
            ],
          };
        }
        return driver;
      });
      return {
        ...oldData,
        data: updatedData,
      };
    },
  );
};
