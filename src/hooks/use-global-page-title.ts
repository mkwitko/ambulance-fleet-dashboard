import { useEffect } from "react";
import { useGetUnreadMessagesByPlatform } from "@/http/generated/chat/chat";
import useGetUserPermissions from "@/hooks/use-get-user-permissions";
import { STATUS_ORDER } from "@/utils/ambulance-status";
import {
  GetChatsPlatform,
  GetChatsStatusItem,
  type GetAuthenticatedUserPermissions200,
} from "@/http/generated/connect-server.schemas";
import { hasPermission } from "@/utils/permissions";
import { Role } from "@/@types/roles";

const DEFAULT_TITLE = "Connect";

export default function useGlobalPageTitle({
  userPermissions,
}: {
  userPermissions: GetAuthenticatedUserPermissions200 | undefined;
}) {
  const { queryParams, hasSomePermission } = useGetUserPermissions();

  const { data: unreadMessages, refetch: refetchUnreadMessages } =
    useGetUnreadMessagesByPlatform(
      {
        ...queryParams,
        platform: GetChatsPlatform.WEB,
        status: STATUS_ORDER as GetChatsStatusItem[], // Todos os status para pegar todas as mensagens não lidas
      },
      {
        query: {
          enabled:
            hasSomePermission &&
            hasPermission(userPermissions?.data, Role["chat:read"]),
          // Refetch em background para manter atualizado
          refetchInterval: 30000, // 30 segundos
        },
      },
    );

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

  return {
    refetchUnreadMessages,
  };
}
