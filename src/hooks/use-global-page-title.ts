import { useEffect } from "react";
import { useGetChats } from "@/http/generated/chat/chat";
import {
  GetChatsPlatform,
  type GetChatsStatusItem,
} from "@/http/generated/connectServer.schemas";
import useGetUserPermissions from "@/hooks/use-get-user-permissions";
import useAbly from "@/hooks/use-ably";
import { AblyEvents } from "@/@types/ably-events";
import { queryClient } from "@/lib/react-query";
import type {
  GetChats200,
  GetChatMessages200DataItem,
} from "@/http/generated/connectServer.schemas";
import { getUnreadChatMessages } from "@/http/generated/chat/chat";
import { realTimeUpdateChatListMessage } from "@/pages/protected/chats/chats-list/realtime/update-chat-sidebar-message";
import { realTimeUpdateChatReadAt } from "@/pages/protected/chats/chats-list/realtime/update-chat-read-at";
import { STATUS_ORDER } from "@/utils/ambulance-status";

const DEFAULT_TITLE = "Connect App";

export default function useGlobalPageTitle() {
  const { queryParams, hasSomePermission } = useGetUserPermissions();

  // Busca todos os chats (com todos os status para ter o total completo de mensagens não lidas)
  const { data: chats, queryKey } = useGetChats(
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
  useAbly({
    events: [AblyEvents.messages, AblyEvents.readChat],
    handleMessageReceived: async (message) => {
      if (!queryKey) return;

      // Atualiza quando uma nova mensagem chega
      if (message.name === AblyEvents.messages) {
        const parsedMessage = message.data as GetChatMessages200DataItem;
        try {
          const unreadChatData = await getUnreadChatMessages(
            parsedMessage.chatId,
            {
              unitId: parsedMessage.chat.ambulance.unitId,
            },
          );

          queryClient.setQueryData(
            queryKey,
            (oldData: GetChats200 | undefined) => {
              if (!oldData) return oldData;
              return realTimeUpdateChatListMessage({
                incomingMessage: message,
                oldData,
                unreadChatData,
              });
            },
          );
        } catch (error) {
          console.error("Error updating unread count:", error);
        }
      }

      // Atualiza quando um chat é marcado como lido
      if (message.name === AblyEvents.readChat) {
        queryClient.setQueryData(
          queryKey,
          (oldData: GetChats200 | undefined) => {
            if (!oldData) return oldData;
            const result = realTimeUpdateChatReadAt({
              incomingMessage: message,
              oldData,
              setSelectedChat: () => {}, // Não precisamos atualizar chat selecionado aqui
            });
            // Retorna apenas os dados atualizados, ignorando o setSelectedChat
            return result;
          },
        );
      }
    },
  });

  // Atualiza o título da aba quando os chats mudam
  useEffect(() => {
    if (!chats?.data) {
      document.title = DEFAULT_TITLE;
      return;
    }

    // Calcula o total de mensagens não lidas somando todos os unreadCountWeb
    const totalUnread = chats.data.reduce((total, chat) => {
      return total + (chat.unreadCountWeb || 0);
    }, 0);

    // Atualiza o título da aba
    if (totalUnread > 0) {
      document.title = `(${totalUnread}) ${DEFAULT_TITLE}`;
    } else {
      document.title = DEFAULT_TITLE;
    }
  }, [chats]);
}
