import type {
  GetChatMessages200DataItem,
  GetChats200DataItem,
} from "@/http/generated/connectServer.schemas";
import * as Ably from "ably";

export const realtTimeUpdateChatMessage = ({
  incomingMessage,
  selectedChat,
  setMessages,
}: {
  incomingMessage: Ably.InboundMessage;
  selectedChat: GetChats200DataItem | undefined;
  setMessages: React.Dispatch<
    React.SetStateAction<GetChatMessages200DataItem[]>
  >;
}) => {
  const message = {
    ...incomingMessage.data,
    isNew: true,
  } as GetChatMessages200DataItem;
  // Atualiza a lista de mensagens do chat selecionado
  setMessages((prevMessages) => {
    // Verifica se a mensagem já existe na lista
    if (
      message &&
      message.chatId === selectedChat?.id &&
      !prevMessages.some((msg) => msg.id === message.id)
    ) {
      return [...prevMessages, message];
    }
    return prevMessages;
  });
};
