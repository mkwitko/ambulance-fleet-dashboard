import { getGetChatsQueryKey } from "@/http/generated/chat/chat";
import type { GetChats200 } from "@/http/generated/connect-server.schemas";
import { queryClient } from "@/lib/react-query";
import type { InboundMessage } from "ably";
import type { RealTimeUpdateChatStatusMessage } from "./update-ambulance-control-status";

export const updateChatStatus = ({
  incomingMessage,
}: {
  incomingMessage: InboundMessage;
}) => {
  queryClient.setQueriesData<GetChats200>(
    {
      predicate: (query) => query.queryKey[0] === getGetChatsQueryKey()[0],
    },
    (oldData) => {
      const message = incomingMessage.data as RealTimeUpdateChatStatusMessage;

      if (!oldData) return oldData;
      // Atualiza o chat correspondente com a nova mensagem
      const updatedData = oldData.data.map((chat) => {
        if (
          message &&
          message.chatIds.includes(chat.id) &&
          !chat.messages?.some((msg) => msg.id === message.id)
        ) {
          return {
            ...chat,
            ambulance: {
              ...chat.ambulance,
              status: message.status,
            },
          };
        }
        return chat;
      });

      return {
        ...oldData,
        data: updatedData,
      };
    },
  );
};
