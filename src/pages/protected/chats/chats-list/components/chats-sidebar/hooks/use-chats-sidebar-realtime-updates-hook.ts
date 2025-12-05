import type {
  GetChatMessages200DataItem,
  GetChats200,
  GetChats200DataItem,
} from "@/http/generated/connectServer.schemas";
import { queryClient } from "@/lib/react-query";
import { useEffect } from "react";
import { realTimeUpdateChatStatus } from "../../../realtime/update-chat-status";
import * as Ably from "ably";
import type { dataTagSymbol, dataTagErrorSymbol } from "@tanstack/react-query";
import { AblyEvents } from "@/@types/ably-events";
import { realTimeUpdateChatReadAt } from "../../../realtime/update-chat-read-at";
import { realTimeUpdateChatListMessage } from "../../../realtime/update-chat-sidebar-message";
import { getUnreadChatMessages } from "@/http/generated/chat/chat";

export default function useChatsSidebarRealtimeUpdateHook({
  incomingMessage,
  queryKey,
  setSelectedChat,
}: {
  incomingMessage: Ably.InboundMessage | undefined;
  queryKey: readonly unknown[] & {
    [dataTagSymbol]: GetChats200;
    [dataTagErrorSymbol]: unknown;
  };
  setSelectedChat: React.Dispatch<
    React.SetStateAction<GetChats200DataItem | undefined>
  >;
}) {
  const updateRealTimeChatList = async () => {
    if (!incomingMessage) return;

    if (incomingMessage.name === AblyEvents.messages) {
      const message = incomingMessage.data as GetChatMessages200DataItem;
      const unreadChatData = await getUnreadChatMessages(message.chatId, {
        unitId: message.chat.ambulance.unitId,
      });
      queryClient.setQueryData(queryKey, (oldData: GetChats200 | undefined) => {
        if (!oldData) return oldData;
        return realTimeUpdateChatListMessage({
          incomingMessage,
          oldData,
          unreadChatData,
        });
      });
    }

    if (incomingMessage.name === AblyEvents.status) {
      queryClient.setQueryData(queryKey, (oldData: GetChats200 | undefined) => {
        if (!oldData) return oldData;
        return realTimeUpdateChatStatus({
          incomingMessage,
          oldData,
          setSelectedChat,
        });
      });
    }

    if (incomingMessage.name === AblyEvents.readChat) {
      queryClient.setQueryData(queryKey, (oldData: GetChats200 | undefined) => {
        if (!oldData) return oldData;
        return realTimeUpdateChatReadAt({
          incomingMessage,
          oldData,
          setSelectedChat,
        });
      });
    }
  };
  useEffect(() => {
    if (!incomingMessage) return;
    updateRealTimeChatList();
  }, [incomingMessage]);
}
