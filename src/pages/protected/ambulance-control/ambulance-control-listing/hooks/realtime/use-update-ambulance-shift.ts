import type {
  GetAmbulancesControl200,
  SwitchAmbulanceShift204,
} from "@/http/generated/connectServer.schemas";
import * as Ably from "ably";

export const realTimeUpdateAmbulanceShift = ({
  incomingMessage,
  oldData,
}: {
  incomingMessage: Ably.InboundMessage;
  oldData: GetAmbulancesControl200 | undefined;
}) => {
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
};
