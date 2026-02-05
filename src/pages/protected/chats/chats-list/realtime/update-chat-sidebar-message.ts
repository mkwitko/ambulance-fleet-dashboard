import type {
  GetChats200,
  GetChatMessages200DataItem,
  GetUnreadChatMessages200,
  GetChats200DataItem,
} from "@/http/generated/connect-server.schemas";
import * as Ably from "ably";

export const realTimeUpdateChatListMessage = ({
  incomingMessage,
  oldData,
  unreadChatData,
}: {
  incomingMessage: Ably.InboundMessage;
  oldData: GetChats200;
  unreadChatData: GetUnreadChatMessages200;
}) => {
  const message = incomingMessage.data as GetChatMessages200DataItem;

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
};
