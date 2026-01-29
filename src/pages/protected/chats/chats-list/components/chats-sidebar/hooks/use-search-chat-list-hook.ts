import type {
  GetChats200,
} from "@/http/generated/connectServer.schemas";
import { useMemo, useState } from "react";

export default function useSearchChatListHook({
  chats,
}: {
  chats: GetChats200 | undefined;
}) {
  const [search, setSearch] = useState("");

  const filteredChats = useMemo(() => {
    let result = chats?.data || [];

    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter((c: any) =>
        (c.ambulance?.name || "").toLowerCase().includes(s)
      );
    }

    return result;
  }, [search, chats?.data]);

  return {
    search,
    setSearch,
    filteredChats,
  };
}
