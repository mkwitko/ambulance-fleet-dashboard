import { getGetChatsQueryKey } from "@/http/generated/chat/chat";
import type {
  GetChats200,
  GetChats200DataItem,
} from "@/http/generated/connect-server.schemas";
import { queryClient } from "@/lib/react-query";
import type { InboundMessage } from "ably";

export const updateChatPhone = ({
  incomingMessage,
}: {
  incomingMessage: InboundMessage;
}) => {
  queryClient.setQueriesData<GetChats200>(
    {
      predicate: (query) => query.queryKey[0] === getGetChatsQueryKey()[0],
    },
    (oldData) => {
      if (!oldData) return oldData;

      // Atualiza a lista de chats com a mensagem mais nova
      const updatedData = oldData.data.map((chat) => {
        if (incomingMessage.data && chat.id === incomingMessage.data.chatId) {
          return {
            ...chat,
            currentPhone: incomingMessage.data.currentPhone,
          };
        }
        return chat;
      });

      return {
        ...oldData,
        data: updatedData as GetChats200DataItem[],
      };
    },
  );
};
