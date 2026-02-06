import { getGetChatsQueryKey } from "@/http/generated/chat/chat";
import {
  ReadChatBodyPlatform,
  type GetChats200,
  type ReadChat201,
} from "@/http/generated/connect-server.schemas";
import { queryClient } from "@/lib/react-query";
import type { InboundMessage } from "ably";

export const updateChatReadAt = ({
  incomingMessage,
}: {
  incomingMessage: InboundMessage;
}) => {
  queryClient.setQueriesData<GetChats200>(
    {
      predicate: (query) => query.queryKey[0] === getGetChatsQueryKey()[0],
    },
    (oldData) => {
      const message = incomingMessage.data as ReadChat201;

      if (!oldData) return oldData;
      // Atualiza o chat correspondente com a nova mensagem
      const updatedData = oldData.data.map((chat) => {
        if (message && chat.id === message.id) {
          return {
            ...chat,
            unreadCountWeb: 0,
            readByAppAt:
              message.platform === ReadChatBodyPlatform.APP
                ? message.readAt
                : chat.readByAppAt,
            readByWebAt:
              message.platform === ReadChatBodyPlatform.WEB
                ? message.readAt
                : chat.readByWebAt,
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
