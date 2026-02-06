import {
  ReadChatBodyPlatform,
  type GetChatMessages200DataItem,
  type GetChats200DataItem,
} from "@/http/generated/connect-server.schemas";
import { useState } from "react";
import ChatsSidebar from "./components/chats-sidebar/chats-sidebar";
import Chat from "./components/chat/chat";
import * as Ably from "ably";
import useAbly from "@/hooks/use-ably";
import { AblyEvents } from "@/@types/ably-events";
import {
  getGetUnreadMessagesByPlatformQueryKey,
  useReadChat,
} from "@/http/generated/chat/chat";
import { queryClient } from "@/lib/react-query";

export default function ChatsList() {
  const [selectedChat, setSelectedChat] = useState<
    GetChats200DataItem | undefined
  >();
  const [incomingMessage, setIncomingMessage] = useState<Ably.InboundMessage>();

  const { mutateAsync: readChat } = useReadChat();

  useAbly({
    events: [
      {
        event: AblyEvents.messages,
      },
      {
        event: AblyEvents.status,
      },
      {
        event: AblyEvents.readChat,
      },
    ],
    handleMessageReceived: async (message) => {
      if (message.name === AblyEvents.messages) {
        const parsedMessage = message.data as GetChatMessages200DataItem;

        // Se o chat estiver aberto, marca como lida a mensagem
        if (parsedMessage.chatId === selectedChat?.id) {
          await readChat({
            id: selectedChat.id,
            data: {
              platform: ReadChatBodyPlatform.WEB,
              unitId: selectedChat.ambulance.unitId,
            },
          });

          queryClient.invalidateQueries({
            queryKey: getGetUnreadMessagesByPlatformQueryKey(),
          });
        }
      }
      setIncomingMessage(message);
    },
  });

  return (
    <div className="bg-connect flex h-[calc(100vh-9rem)]">
      <ChatsSidebar
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
      />

      <Chat
        selectedChat={selectedChat}
        onBack={() => setSelectedChat(undefined)}
        incomingMessage={incomingMessage}
        setIncomingMessage={setIncomingMessage}
      />
    </div>
  );
}
