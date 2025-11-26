import type {
  GetChatMessages200DataItem,
  GetChats200DataItem,
} from "@/http/generated/connectServer.schemas";
import { useState } from "react";
import ChatsSidebar from "./components/chats-sidebar";
import Chat from "./components/chat/chat";
import * as Ably from "ably";
import { playNotification } from "@/utils/notification";
import useAbly from "@/hooks/use-ably";
export default function ChatsList() {
  const [selectedChat, setSelectedChat] = useState<
    GetChats200DataItem | undefined
  >();

  const [incomingMessage, setIncomingMessage] = useState<Ably.InboundMessage>();

  const { user } = useAbly({
    events: ["messages", "status"],
    handleMessageReceived: (message) => {
      setIncomingMessage(message);

      if (message.name === "messages") {
        chatMessageReceived(message);
      }
    },
  });

  const chatMessageReceived = (message: Ably.InboundMessage) => {
    const parsedMessage = message.data as GetChatMessages200DataItem;
    playNotification(parsedMessage, user);
  };

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
        user={user?.data}
        incomingMessage={incomingMessage}
      />
    </div>
  );
}
