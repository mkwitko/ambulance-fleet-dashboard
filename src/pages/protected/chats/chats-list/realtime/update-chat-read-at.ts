import {
  ReadChatBodyPlatform,
  type GetChats200,
  type GetChats200DataItem,
  type ReadChat201,
} from "@/http/generated/connect-server.schemas";
import * as Ably from "ably";
import type { Dispatch, SetStateAction } from "react";

export const realTimeUpdateChatReadAt = ({
  incomingMessage,
  oldData,
  setSelectedChat,
}: {
  incomingMessage: Ably.InboundMessage;
  oldData: GetChats200;
  setSelectedChat: Dispatch<SetStateAction<GetChats200DataItem | undefined>>;
}) => {
  const message = incomingMessage.data as ReadChat201;
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

  setSelectedChat((prevChat) => {
    if (!prevChat) return prevChat;
    if (message.id === prevChat.id) {
      return {
        ...prevChat,
        unreadCountWeb: 0,
        readByAppAt:
          message.platform === ReadChatBodyPlatform.APP
            ? message.readAt
            : prevChat.readByAppAt,
        readByWebAt:
          message.platform === ReadChatBodyPlatform.WEB
            ? message.readAt
            : prevChat.readByWebAt,
      };
    }
    return prevChat;
  });

  return {
    ...oldData,
    data: updatedData,
  };
};
