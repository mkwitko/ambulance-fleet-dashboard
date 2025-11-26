import type {
  GetChats200,
  GetChats200DataItem,
  SwitchAmbulanceStatusBodyStatus,
} from "@/http/generated/connectServer.schemas";
import * as Ably from "ably";
import type { Dispatch, SetStateAction } from "react";

export interface RealTimeUpdateChatStatusMessage {
  id: string;
  chatIds: string[];
  status: SwitchAmbulanceStatusBodyStatus;
}

export const realTimeUpdateChatStatus = ({
  incomingMessage,
  oldData,
  setSelectedChat,
}: {
  incomingMessage: Ably.InboundMessage;
  oldData: GetChats200;
  setSelectedChat: Dispatch<SetStateAction<GetChats200DataItem | undefined>>;
}) => {
  const message = incomingMessage.data as RealTimeUpdateChatStatusMessage;
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

  setSelectedChat((prevChat) => {
    if (!prevChat) return prevChat;
    if (message.chatIds.includes(prevChat.id)) {
      return {
        ...prevChat,
        ambulance: {
          ...prevChat.ambulance,
          status: message.status,
        },
      };
    }
    return prevChat;
  });

  return {
    ...oldData,
    data: updatedData,
  };
};
