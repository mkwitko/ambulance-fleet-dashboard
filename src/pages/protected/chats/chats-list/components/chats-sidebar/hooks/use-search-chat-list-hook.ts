import type { GetChats200 } from "@/http/generated/connectServer.schemas";
import { STATUS_ORDER } from "@/utils/ambulance-status";
import { useMemo, useState } from "react";

export default function useSearchChatListHook({
  chats,
}: {
  chats: GetChats200 | undefined;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>(STATUS_ORDER);

  const filteredChats = useMemo(() => {
    let result = chats?.data || [];

    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter((c: any) =>
        (c.ambulance?.name || "").toLowerCase().includes(s)
      );
    }

    // Se statusFilter incluir 'all' ou estiver vazio => não filtrar por status
    if (!statusFilter || statusFilter.length === 0) {
      return result;
    }

    const wanted = new Set(statusFilter);
    result = result.filter((c: any) => {
      const st = c?.ambulance?.status;
      return st && wanted.has(st);
    });

    return result;
  }, [search, statusFilter, chats?.data]);

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    filteredChats,
  };
}
