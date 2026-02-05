import { useStatusFilterContext } from "@/context/status-filter-context";
import useGetUserPermissions from "@/hooks/use-get-user-permissions";
import { useGetChats } from "@/http/generated/chat/chat";
import { GetChatsPlatform } from "@/http/generated/connect-server.schemas";
import { useEffect } from "react";

export default function useChatListHook() {
  const { statusFilter } = useStatusFilterContext();
  const { queryParams, hasSomePermission } = useGetUserPermissions();

  const { data: chats, queryKey } = useGetChats(
    {
      ...queryParams,
      platform: GetChatsPlatform.WEB,
      status: statusFilter,
    },
    {
      query: {
        enabled: hasSomePermission,
      },
    },
  );

  useEffect(() => {
    console.log("Chats updated:", chats);
  }, [chats]);

  return {
    chats,
    queryKey,
  };
}
