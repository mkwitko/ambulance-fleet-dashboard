import { useEffect } from "react";
import { realtTimeUpdateChatMessage } from "../../../realtime/update-chat-message";
import type {
  GetChats200DataItem,
  GetChatMessages200DataItem,
} from "@/http/generated/connect-server.schemas";
import * as Ably from "ably";
import { AblyEvents } from "@/@types/ably-events";

export default function useRealtimeChatMessages({
  incomingMessage,
  selectedChat,
  setMessages,
}: {
  incomingMessage: Ably.InboundMessage | undefined;
  selectedChat: GetChats200DataItem | undefined;
  setMessages: React.Dispatch<
    React.SetStateAction<GetChatMessages200DataItem[]>
  >;
}) {
  useEffect(() => {
    if (!incomingMessage) return;
    if (incomingMessage.name === AblyEvents.messages) {
      realtTimeUpdateChatMessage({
        incomingMessage,
        selectedChat,
        setMessages,
      });
    }
  }, [incomingMessage]);
}
