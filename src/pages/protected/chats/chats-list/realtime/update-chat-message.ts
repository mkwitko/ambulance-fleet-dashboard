import type {
  GetChats200,
  GetChatMessages200DataItem,
} from "@/http/generated/connectServer.schemas";
import * as Ably from "ably";

export const realTimeUpdateChatMessage = ({
  incomingMessage,
  oldData,
}: {
  incomingMessage: Ably.InboundMessage;
  oldData: GetChats200;
}) => {
  const message = incomingMessage.data as GetChatMessages200DataItem;

  // Atualiza o chat correspondente com a nova mensagem
  const updatedData = oldData.data.map((chat) => {
    if (
      message &&
      chat.id === message.chatId &&
      !chat.messages?.some((msg) => msg.id === message.id)
    ) {
      return {
        ...chat,
        messages: [message],
      };
    }
    return chat;
  });

  return {
    ...oldData,
    data: updatedData,
  };
};
