import { getGetAmbulancesControlQueryKey } from "@/http/generated/ambulance/ambulance";
import type {
  GetAmbulancesControl200,
  SwitchAmbulanceShift204,
} from "@/http/generated/connect-server.schemas";
import { queryClient } from "@/lib/react-query";
import type { InboundMessage } from "ably";

export const updateAmbulanceControlShift = ({
  incomingMessage,
}: {
  incomingMessage: InboundMessage;
}) => {
  queryClient.setQueriesData<GetAmbulancesControl200>(
    {
      predicate: (query) =>
        query.queryKey[0] === getGetAmbulancesControlQueryKey()[0],
    },
    (oldData) => {
      const message = incomingMessage.data as SwitchAmbulanceShift204;

      if (!oldData) return oldData;
      // Atualiza o chat correspondente com a nova mensagem
      const updatedData = oldData?.data.map((ambulance) => {
        if (message && message.id === ambulance.id) {
          return {
            ...ambulance,
            ambulanceShiftHistories: [
              {
                id: message.id,
                shiftStart: message.shiftStart,
                shiftEnd: message.shiftEnd,
              },
            ],
          };
        }
        return ambulance;
      });

      const response = {
        ...oldData,
        data: updatedData,
      };

      return response;
    },
  );
};
