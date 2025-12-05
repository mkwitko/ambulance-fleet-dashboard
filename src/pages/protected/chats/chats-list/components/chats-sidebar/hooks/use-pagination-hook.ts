import type { GetChats200DataItem } from "@/http/generated/connectServer.schemas";

export default function usePaginationHook({
  page,
  setPage,
  perPage,
  filteredChats,
}: {
  page: number;
  setPage: (page: number) => void;
  perPage: number;
  filteredChats: GetChats200DataItem[];
}) {
  // Paginação
  const totalPages = Math.max(1, Math.ceil(filteredChats.length / perPage));
  const paginatedChats = filteredChats.slice(
    (page - 1) * perPage,
    page * perPage
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return {
    totalPages,
    paginatedChats,
    handlePageChange,
  };
}
