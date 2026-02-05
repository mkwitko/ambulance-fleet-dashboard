import type {
  GetAmbulancesControl200,
  SwitchAmbulanceStatusBodyStatus,
} from "@/http/generated/connect-server.schemas";
import * as Ably from "ably";

export interface RealTimeUpdateChatStatusMessage {
  id: string;
  chatIds: string[];
  status: SwitchAmbulanceStatusBodyStatus;
}

export const realTimeUpdateAmbulanceStatus = ({
  incomingMessage,
  oldData,
}: {
  incomingMessage: Ably.InboundMessage;
  oldData: GetAmbulancesControl200 | undefined;
}) => {
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
};
