import {
  getUnreadChatMessages,
  getGetChatsQueryKey,
} from "@/http/generated/chat/chat";
import type {
  GetChatMessages200DataItem,
  GetChats200,
  GetChats200DataItem,
} from "@/http/generated/connect-server.schemas";
import { queryClient } from "@/lib/react-query";

export const updateChatUnreadMessages = async ({
  message,
}: {
  message: GetChatMessages200DataItem;
}) => {
  const unreadChatData = await getUnreadChatMessages(message.chatId, {
    unitId: message.chat.ambulance.unitId,
  });
  queryClient.setQueriesData<GetChats200>(
    {
      predicate: (query) => query.queryKey[0] === getGetChatsQueryKey()[0],
    },
    (oldData) => {
      if (!oldData) return oldData;

      // Atualiza a lista de chats com a mensagem mais nova
      const updatedData = oldData.data.map((chat) => {
        if (
          message &&
          chat.id === message.chatId &&
          !chat.messages?.some((msg) => msg.id === message.id)
        ) {
          return {
            ...chat,
            messages: [message],
            unreadCountWeb: unreadChatData?.data?.unreadCountWeb || 0,
            lastMessageAt: unreadChatData?.data?.lastMessageAt || 0,
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
