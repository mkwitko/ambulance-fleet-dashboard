import useGetUserPermissions from "@/hooks/use-get-user-permissions";
import { useGetChats } from "@/http/generated/chat/chat";
import {
  GetChatsPlatform,
  type GetChatsStatusItem,
} from "@/http/generated/connectServer.schemas";

export default function useChatListHook({
  statusFilter,
}: {
  statusFilter: GetChatsStatusItem[];
}) {
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
    }
  );

  return {
    chats,
    queryKey,
  };
}

