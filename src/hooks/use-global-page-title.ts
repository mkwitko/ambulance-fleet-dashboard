import { useEffect } from "react";
import { useGetUnreadMessagesByPlatform } from "@/http/generated/chat/chat";
import useGetUserPermissions from "@/hooks/use-get-user-permissions";
import useAbly from "@/hooks/use-ably";
import { AblyEvents } from "@/@types/ably-events";
import { STATUS_ORDER } from "@/utils/ambulance-status";
import { playNotification } from "@/utils/notification";
import {
  GetChatsPlatform,
  GetChatsStatusItem,
  type GetChatMessages200DataItem,
} from "@/http/generated/connect-server.schemas";

const DEFAULT_TITLE = "Connect App";

export default function useGlobalPageTitle() {
  const { queryParams, hasSomePermission } = useGetUserPermissions();

  const { data: unreadMessages, refetch } = useGetUnreadMessagesByPlatform(
    {
      ...queryParams,
      platform: GetChatsPlatform.WEB,
      status: STATUS_ORDER as GetChatsStatusItem[], // Todos os status para pegar todas as mensagens não lidas
    },
    {
      query: {
        enabled: hasSomePermission,
        // Refetch em background para manter atualizado
        refetchInterval: 30000, // 30 segundos
      },
    },
  );

  // Escuta eventos do websocket para atualizar em tempo real
  const { user } = useAbly({
    events: [AblyEvents.messages, AblyEvents.readChat],
    handleMessageReceived: async (message) => {
      const parsedMessage = message.data as GetChatMessages200DataItem;

      //  Notificação sonora para novas mensagens
      if (message.name === AblyEvents.messages) {
        playNotification(parsedMessage, user);
      }

      try {
        refetch();
      } catch (error) {
        console.error("Error updating unread count:", error);
      }
    },
  });

  // Atualiza o título da aba quando os chats mudam
  useEffect(() => {
    if (!unreadMessages?.data) {
      document.title = DEFAULT_TITLE;
      return;
    }

    // Calcula o total de mensagens não lidas somando todos os unreadCountWeb
    const totalUnread = unreadMessages.data.unreadCount;

    // Atualiza o título da aba
    if (totalUnread > 0) {
      document.title = `(${totalUnread}) ${DEFAULT_TITLE}`;
    } else {
      document.title = DEFAULT_TITLE;
    }
  }, [unreadMessages]);
}
