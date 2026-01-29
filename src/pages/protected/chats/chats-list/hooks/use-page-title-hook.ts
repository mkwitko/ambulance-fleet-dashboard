import { useEffect } from "react";
import type { GetChats200 } from "@/http/generated/connectServer.schemas";

const DEFAULT_TITLE = "Connect App";

export default function usePageTitleHook({
  chats,
}: {
  chats: GetChats200 | undefined;
}) {
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
