import type { GetChats200DataItem } from "@/http/generated/connect-server.schemas";
import { useState } from "react";
import ChatsSidebar from "./components/chats-sidebar/chats-sidebar";
import Chat from "./components/chat/chat";
import * as Ably from "ably";
import useAbly from "@/hooks/use-ably";
import { AblyEvents } from "@/@types/ably-events";

export default function ChatsList() {
  const [selectedChat, setSelectedChat] = useState<
    GetChats200DataItem | undefined
  >();
  const [incomingMessage, setIncomingMessage] = useState<Ably.InboundMessage>();

  useAbly({
    events: [AblyEvents.messages, AblyEvents.status, AblyEvents.readChat],
    handleMessageReceived: (message) => {
      setIncomingMessage(message);
    },
  });

  return (
    <div className="bg-connect flex h-[calc(100vh-9rem)]">
      <ChatsSidebar
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
        incomingMessage={incomingMessage}
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
