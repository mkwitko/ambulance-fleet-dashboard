import useGetUserPermissions from "@/hooks/use-get-user-permissions";
import { useGetChats } from "@/http/generated/chat/chat";
import { GetChatsPlatform } from "@/http/generated/connectServer.schemas";

export default function useChatListHook() {
  const { queryParams, hasSomePermission } = useGetUserPermissions();

  const { data: chats, queryKey } = useGetChats(
    {
      ...queryParams,
      platform: GetChatsPlatform.WEB,
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
