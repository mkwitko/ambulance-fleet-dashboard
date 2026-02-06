import { getGetAmbulancesControlQueryKey } from "@/http/generated/ambulance/ambulance";
import type {
  GetAmbulancesControl200,
  SwitchAmbulanceStatusBodyStatus,
} from "@/http/generated/connect-server.schemas";
import { queryClient } from "@/lib/react-query";
import type { InboundMessage } from "ably";

export interface RealTimeUpdateChatStatusMessage {
  id: string;
  chatIds: string[];
  status: SwitchAmbulanceStatusBodyStatus;
}

export const updateAmbulanceControlStatus = ({
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
      const message = incomingMessage.data as RealTimeUpdateChatStatusMessage;

      if (!oldData) return oldData;
      // Atualiza o chat correspondente com a nova mensagem
      const updatedData = oldData?.data.map((ambulance) => {
        if (message && message.id === ambulance.id) {
          return {
            ...ambulance,
            status: message.status,
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
